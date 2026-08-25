use std::env;
use std::collections::HashMap;
use serde::Serialize;

#[derive(Serialize)]
struct OverusedWord {
    word: String,
    count: usize,
    percentage: f64,
    synonyms: Vec<String>,
}

#[derive(Serialize)]
struct AnalysisResults {
    reading_time_mins: f64,
    lexical_density: f64,
    top_words: Vec<(String, usize)>,
    sentence_count: usize,
    avg_word_length: f64,
    szigriszt_score: f64,
    szigriszt_interpretation: String,
    overused_words: Vec<OverusedWord>,
}

fn count_syllables_es(word: &str) -> usize {
    let word = word.to_lowercase();
    let chars: Vec<char> = word.chars().collect();
    if chars.is_empty() { return 0; }
    
    let mut syllables = 0;
    let mut i = 0;
    
    let is_vowel = |c: char| -> bool {
        match c {
            'a' | 'e' | 'i' | 'o' | 'u' | 'y' |
            'á' | 'é' | 'í' | 'ó' | 'ú' | 'ü' => true,
            _ => false
        }
    };
    
    while i < chars.len() {
        if is_vowel(chars[i]) {
            syllables += 1;
            while i + 1 < chars.len() && is_vowel(chars[i + 1]) {
                let strong_vowels = ['a', 'e', 'o', 'á', 'é', 'ó'];
                if strong_vowels.contains(&chars[i]) && strong_vowels.contains(&chars[i + 1]) {
                    syllables += 1;
                }
                i += 1;
            }
        }
        i += 1;
    }
    
    if syllables == 0 { 1 } else { syllables }
}

fn get_szigriszt_interpretation(score: f64) -> String {
    if score >= 85.0 {
        "Muy fácil".to_string()
    } else if score >= 70.0 {
        "Fácil".to_string()
    } else if score >= 60.0 {
        "Bastante fácil".to_string()
    } else if score >= 50.0 {
        "Algo difícil".to_string()
    } else if score >= 30.0 {
        "Difícil".to_string()
    } else {
        "Muy difícil / Científico".to_string()
    }
}

fn get_synonyms(word: &str) -> Vec<String> {
    let mut syns = HashMap::new();
    syns.insert("hacer", vec!["realizar", "elaborar", "crear", "ejecutar"]);
    syns.insert("decir", vec!["expresar", "comentar", "afirmar", "declarar"]);
    syns.insert("importante", vec!["clave", "relevante", "esencial", "crucial"]);
    syns.insert("tema", vec!["asunto", "materia", "tópico", "cuestión"]);
    syns.insert("crear", vec!["generar", "diseñar", "producir", "fomentar"]);
    syns.insert("post", vec!["publicación", "artículo", "nota", "mensaje"]);
    syns.insert("gente", vec!["personas", "público", "audiencia", "usuarios"]);
    syns.insert("trabajo", vec!["labor", "tarea", "desempeño", "actividad"]);
    syns.insert("gran", vec!["enorme", "destacado", "notable", "magnífico"]);
    syns.insert("bueno", vec!["positivo", "beneficioso", "excelente", "adecuado"]);
    syns.insert("herramienta", vec!["instrumento", "recurso", "utilidad", "aplicación"]);
    syns.insert("usar", vec!["utilizar", "emplear", "aplicar", "aprovechar"]);
    syns.insert("problema", vec!["dificultad", "conflicto", "inconveniente", "obstáculo"]);

    syns.get(word).map(|v| v.iter().map(|s| s.to_string()).collect()).unwrap_or_default()
}

fn main() {
    let args: Vec<String> = env::args().collect();
    if args.len() < 2 {
        eprintln!("Usage: {} <text>", args[0]);
        std::process::exit(1);
    }

    let text = &args[1];
    
    // Conteo de palabras y oraciones
    let words: Vec<&str> = text.split_whitespace()
        .map(|w| w.trim_matches(|c: char| !c.is_alphanumeric() && c != '#'))
        .filter(|w| !w.is_empty())
        .collect();
    
    let word_count = words.len();
    let sentence_count = text.split(|c| c == '.' || c == '!' || c == '?')
        .filter(|s| !s.trim().is_empty())
        .count().max(1); // Evitar división por cero

    // Tiempo de lectura (aprox 200 palabras por minuto)
    let reading_time_mins = (word_count as f64 / 200.0).max(0.1);

    // Conteo de sílabas
    let mut total_syllables = 0;
    let mut word_freq = HashMap::new();
    for word in &words {
        let clean_word = word.to_lowercase();
        total_syllables += count_syllables_es(&clean_word);
        let count = word_freq.entry(clean_word).or_insert(0);
        *count += 1;
    }

    // Densidad léxica
    let unique_words = word_freq.len();
    let lexical_density = if word_count > 0 {
        (unique_words as f64 / word_count as f64) * 100.0
    } else {
        0.0
    };

    // Flesch-Szigriszt para español
    // Szigriszt = 206.84 - (60.13 * (silabas / palabras)) - (1.02 * (palabras / oraciones))
    let szigriszt_score = if word_count > 0 {
        let score = 206.84 
            - (60.13 * (total_syllables as f64 / word_count as f64)) 
            - (1.02 * (word_count as f64 / sentence_count as f64));
        score.max(0.0).min(100.0)
    } else {
        0.0
    };
    let szigriszt_interpretation = get_szigriszt_interpretation(szigriszt_score);

    // Top 5 palabras (excluyendo cortas)
    let mut word_vec: Vec<(String, usize)> = word_freq.iter()
        .filter(|(w, _)| w.len() > 3)
        .map(|(w, c)| (w.clone(), *c))
        .collect();
    word_vec.sort_by(|a, b| b.1.cmp(&a.1));
    let top_words = word_vec.iter().cloned().take(5).collect();

    // Palabras sobreutilizadas con sinónimos
    let mut overused_words = Vec::new();
    if word_count > 0 {
        for (word, count) in &word_freq {
            if word.len() > 3 && *count > 2 {
                let percentage = (*count as f64 / word_count as f64) * 100.0;
                // Si la frecuencia es mayor al 3% y tenemos sinónimos en el mapa
                if percentage > 3.0 {
                    let synonyms = get_synonyms(word);
                    if !synonyms.is_empty() {
                        overused_words.push(OverusedWord {
                            word: word.clone(),
                            count: *count,
                            percentage: (percentage * 10.0).round() / 10.0,
                            synonyms,
                        });
                    }
                }
            }
        }
    }
    overused_words.sort_by(|a, b| b.count.cmp(&a.count));

    // Longitud promedio de palabra
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
        szigriszt_score: (szigriszt_score * 10.0).round() / 10.0,
        szigriszt_interpretation,
        overused_words,
    };

    println!("{}", serde_json::to_string(&results).unwrap());
}
