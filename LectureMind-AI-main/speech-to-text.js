document.addEventListener('DOMContentLoaded', function() {
    // --- 1. THEME TOGGLE LOGIC ---
    const body = document.body;
    const themeToggle = document.querySelector('.theme-toggle') || document.getElementById('darkModeToggle');

    // Load saved theme from browser storage
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        body.classList.add('dark-mode');
    }

    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            body.classList.toggle('dark-mode');
            
            // Save preference
            if (body.classList.contains('dark-mode')) {
                localStorage.setItem('theme', 'dark');
            } else {
                localStorage.setItem('theme', 'light');
            }
        });
    }

    // --- 2. LANGUAGE SETTINGS ---
    var langs = [
        ['Afrikaans',       ['af-ZA']],
        ['Bahasa Indonesia',['id-ID']],
        ['Bahasa Melayu',   ['ms-MY']],
        ['Català',          ['ca-ES']],
        ['Čeština',         ['cs-CZ']],
        ['Deutsch',         ['de-DE']],
        ['English',         ['en-AU', 'Australia'], ['en-CA', 'Canada'], ['en-PK', 'Pakistan'], ['en-NZ', 'New Zealand'], ['en-ZA', 'South Africa'], ['en-GB', 'United Kingdom'], ['en-US', 'United States']],
        ['Español',         ['es-AR', 'Argentina'], ['es-BO', 'Bolivia'], ['es-CL', 'Chile'], ['es-CO', 'Colombia'], ['es-CR', 'Costa Rica'], ['es-EC', 'Ecuador'], ['es-SV', 'El Salvador'], ['es-ES', 'España'], ['es-US', 'Estados Unidos'], ['es-GT', 'Guatemala'], ['es-HN', 'Honduras'], ['es-MX', 'México'], ['es-NI', 'Nicaragua'], ['es-PA', 'Panamá'], ['es-PY', 'Paraguay'], ['es-PE', 'Perú'], ['es-PR', 'Puerto Rico'], ['es-DO', 'República Dominicana'], ['es-UY', 'Uruguay'], ['es-VE', 'Venezuela']],
        ['Euskara',         ['eu-ES']],
        ['Français',        ['fr-FR']],
        ['Galego',          ['gl-ES']],
        ['Hrvatski',        ['hr_HR']],
        ['IsiZulu',         ['zu-ZA']],
        ['Íslenska',        ['is-IS']],
        ['Italiano',        ['it-IT', 'Italia'], ['it-CH', 'Svizzera']],
        ['Magyar',          ['hu-HU']],
        ['Nederlands',      ['nl-NL']],
        ['Norsk bokmål',    ['nb-NO']],
        ['Polski',          ['pl-PL']],
        ['Português',       ['pt-BR', 'Brasil'], ['pt-PT', 'Portugal']],
        ['Română',          ['ro-RO']],
        ['Slovenčina',      ['sk-SK']],
        ['Suomi',           ['fi-FI']],
        ['Svenska',         ['sv-SE']],
        ['Türkçe',          ['tr-TR']],
        ['اردو',            ['ur-PK']],
        ['български',       ['bg-BG']],
        ['Pусский',         ['ru-RU']],
        ['Српски',          ['sr-RS']],
        ['한국어',            ['ko-KR']],
        ['中文',             ['cmn-Hans-CN', '普通话 (中国大陆)'], ['cmn-Hans-HK', '普通话 (香港)'], ['cmn-Hant-TW', '中文 (台灣)'], ['yue-Hant-HK', '粵語 (香港)']],
        ['日本語',           ['ja-JP']],
        ['Lingua latīna',   ['la']]
    ];

    let select_language = document.querySelector('#select_language');
    let select_dialect = document.querySelector('#select_dialect');

    // Populate language dropdown
    for (var i = 0; i < langs.length; i++) {
        select_language.options[i] = new Option(langs[i][0], i);
    }

    // Set default to English US
    select_language.selectedIndex = 6;
    updateCountry();
    select_dialect.selectedIndex = 6;

    function updateCountry() {
        for (var i = select_dialect.options.length - 1; i >= 0; i--) {
            select_dialect.remove(i);
        }
        var list = langs[select_language.selectedIndex];
        for (var i = 1; i < list.length; i++) {
            select_dialect.options.add(new Option(list[i][1], list[i][0]));
        }
        select_dialect.style.visibility = list[1].length == 1 ? 'hidden' : 'visible';
    }

    select_language.addEventListener('change', updateCountry);

    // --- 3. SPEECH RECOGNITION ---
    let speechRecognition;
    let final_transcript = "";
    
    if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        speechRecognition = new SpeechRecognition();
        
        speechRecognition.continuous = true;
        speechRecognition.interimResults = true;
        
        speechRecognition.onstart = () => {
            document.querySelector("#status").style.display = "flex";
            document.querySelector("#start").disabled = true;
            document.querySelector("#stop").disabled = false;
        };
        
        speechRecognition.onerror = (event) => {
            document.querySelector("#status").style.display = "none";
            console.error("Speech Recognition Error: " + event.error);
            document.querySelector("#start").disabled = false;
            document.querySelector("#stop").disabled = true;
        };
        
        speechRecognition.onend = () => {
            document.querySelector("#status").style.display = "none";
            document.querySelector("#start").disabled = false;
            document.querySelector("#stop").disabled = true;
            
            if (final_transcript.trim() !== "") {
                // Auto-redirect to generate map
                window.location.href = "/new.html?q=" + encodeURIComponent(final_transcript.trim());
            }
        };

        speechRecognition.onresult = (event) => {
            let interim_transcript = "";

            for (let i = event.resultIndex; i < event.results.length; ++i) {
                if (event.results[i].isFinal) {
                    final_transcript += event.results[i][0].transcript;
                } else {
                    interim_transcript += event.results[i][0].transcript;
                }
            }
            
            const finalElement = document.querySelector("#final");
            const interimElement = document.querySelector("#interim");
            
            if (final_transcript.trim() !== "") {
                finalElement.textContent = final_transcript;
                finalElement.style.color = "#166534";
                finalElement.style.opacity = "1";
            }
            
            interimElement.textContent = interim_transcript;
            
            if (final_transcript.trim() !== "") {
                document.querySelector("#generate-mindmap")?.style.setProperty('display', 'inline-block');
            }
        };
    } else {
        document.querySelector("#start").disabled = true;
        alert("Speech recognition is not supported in your browser. Please use Chrome.");
    }

    // --- 4. BUTTON EVENT LISTENERS ---
    document.querySelector("#start").onclick = () => {
        if (speechRecognition) {
            speechRecognition.lang = document.querySelector("#select_dialect").value;
            speechRecognition.start();
        }
    };
    
    document.querySelector("#stop").onclick = () => {
        if (speechRecognition) speechRecognition.stop();
    };

    document.querySelector("#clear").onclick = () => {
        final_transcript = "";
        const finalElement = document.querySelector("#final");
        finalElement.textContent = "Your final transcript will appear here...";
        finalElement.style.color = "#86efac";
        finalElement.style.opacity = "0.7";
        document.querySelector("#interim").textContent = "";
    };
    
    document.querySelector("#copy").onclick = () => {
        const text = document.querySelector("#final").innerText;
        if (text) {
            navigator.clipboard.writeText(text).then(() => alert("Copied!"));
        }
    };
    
    document.querySelector("#download").onclick = () => {
        const text = document.querySelector("#final").innerText;
        if (text) {
            const blob = new Blob([text], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'transcript.txt';
            a.click();
        }
    };
});
