use std::env;
use std::collections::HashMap;
use serde::Serialize;

#[derive(Serialize)]
struct AnalysisResults {
    reading_time_mins: f64,
    lexical_density: f64,
    top_words: Vec<(String, usize)>,
    sentence_count: usize,
    avg_word_length: f64,
}

fn main() {
    let args: Vec<String> = env::args().collect();
    if args.len() < 2 {
        eprintln!("Usage: {} <text>", args[0]);
        std::process::exit(1);
    }

    let text = &args[1];
    
    // 1. Conteo de palabras y oraciones
    let words: Vec<&str> = text.split_whitespace()
        .map(|w| w.trim_matches(|c: char| !c.is_alphanumeric()))
        .filter(|w| !w.is_empty())
        .collect();
    
    let word_count = words.len();
    let sentence_count = text.split(|c| c == '.' || c == '!' || c == '?')
        .filter(|s| !s.trim().is_empty())
        .count();

    // 2. Tiempo de lectura (aprox 200 palabras por minuto)
    let reading_time_mins = (word_count as f64 / 200.0).max(0.1);

    // 3. Densidad léxica y palabras comunes
    let mut word_freq = HashMap::new();
    for word in &words {
        let count = word_freq.entry(word.to_lowercase()).or_insert(0);
        *count += 1;
    }

    let unique_words = word_freq.len();
    let lexical_density = if word_count > 0 {
        (unique_words as f64 / word_count as f64) * 100.0
    } else {
        0.0
    };

    // 4. Top 5 palabras (excluyendo cortas de menos de 4 letras para evitar preposiciones)
    let mut word_vec: Vec<(String, usize)> = word_freq.into_iter()
        .filter(|(w, _)| w.len() > 3)
        .collect();
    word_vec.sort_by(|a, b| b.1.cmp(&a.1));
    let top_words = word_vec.into_iter().take(5).collect();

    // 5. Longitud promedio de palabra
    let avg_word_length = if word_count > 0 {
        words.iter().map(|w| w.len()).sum::<usize>() as f64 / word_count as f64
    } else {
        0.0
    };

    let results = AnalysisResults {
        reading_time_mins: (reading_time_mins * 100.0).round() / 100.0,
        lexical_density: (lexical_density * 10.0).round() / 10.0,
        top_words,
        sentence_count,
        avg_word_length: (avg_word_length * 10.0).round() / 10.0,
    };

    println!("{}", serde_json::to_string(&results).unwrap());
}
