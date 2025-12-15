document.addEventListener('DOMContentLoaded', function() {
    // Language settings
    var langs =
    [['Afrikaans',       ['af-ZA']],
     ['Bahasa Indonesia',['id-ID']],
     ['Bahasa Melayu',   ['ms-MY']],
     ['Català',          ['ca-ES']],
     ['Čeština',         ['cs-CZ']],
     ['Deutsch',         ['de-DE']],
     ['English',         ['en-AU', 'Australia'],
                         ['en-CA', 'Canada'],
                         ['en-IN', 'India'],
                         ['en-NZ', 'New Zealand'],
                         ['en-ZA', 'South Africa'],
                         ['en-GB', 'United Kingdom'],
                         ['en-US', 'United States']],
     ['Español',         ['es-AR', 'Argentina'],
                         ['es-BO', 'Bolivia'],
                         ['es-CL', 'Chile'],
                         ['es-CO', 'Colombia'],
                         ['es-CR', 'Costa Rica'],
                         ['es-EC', 'Ecuador'],
                         ['es-SV', 'El Salvador'],
                         ['es-ES', 'España'],
                         ['es-US', 'Estados Unidos'],
                         ['es-GT', 'Guatemala'],
                         ['es-HN', 'Honduras'],
                         ['es-MX', 'México'],
                         ['es-NI', 'Nicaragua'],
                         ['es-PA', 'Panamá'],
                         ['es-PY', 'Paraguay'],
                         ['es-PE', 'Perú'],
                         ['es-PR', 'Puerto Rico'],
                         ['es-DO', 'República Dominicana'],
                         ['es-UY', 'Uruguay'],
                         ['es-VE', 'Venezuela']],
     ['Euskara',         ['eu-ES']],
     ['Français',        ['fr-FR']],
     ['Galego',          ['gl-ES']],
     ['Hrvatski',        ['hr_HR']],
     ['IsiZulu',         ['zu-ZA']],
     ['Íslenska',        ['is-IS']],
     ['Italiano',        ['it-IT', 'Italia'],
                         ['it-CH', 'Svizzera']],
     ['Magyar',          ['hu-HU']],
     ['Nederlands',      ['nl-NL']],
     ['Norsk bokmål',    ['nb-NO']],
     ['Polski',          ['pl-PL']],
     ['Português',       ['pt-BR', 'Brasil'],
                         ['pt-PT', 'Portugal']],
     ['Română',          ['ro-RO']],
     ['Slovenčina',      ['sk-SK']],
     ['Suomi',           ['fi-FI']],
     ['Svenska',         ['sv-SE']],
     ['Türkçe',          ['tr-TR']],
     ['български',       ['bg-BG']],
     ['Pусский',         ['ru-RU']],
     ['Српски',          ['sr-RS']],
     ['한국어',            ['ko-KR']],
     ['中文',             ['cmn-Hans-CN', '普通话 (中国大陆)'],
                         ['cmn-Hans-HK', '普通话 (香港)'],
                         ['cmn-Hant-TW', '中文 (台灣)'],
                         ['yue-Hant-HK', '粵語 (香港)']],
     ['日本語',           ['ja-JP']],
     ['Lingua latīna',   ['la']]];

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

    // Update dialects when language changes
    select_language.addEventListener('change', function() {
        updateCountry();
    });

    // Speech recognition functionality
    let speechRecognition;
    let final_transcript = "";
    
    if ("webkitSpeechRecognition" in window) {
        speechRecognition = new webkitSpeechRecognition();
        
        speechRecognition.continuous = true;
        speechRecognition.interimResults = true;
        
        speechRecognition.onstart = () => {
            document.querySelector("#status").style.display = "block";
            document.querySelector("#start").disabled = true;
            document.querySelector("#stop").disabled = false;
        };
        
        speechRecognition.onerror = (event) => {
            document.querySelector("#status").style.display = "none";
            console.log("Speech Recognition Error: " + event.error);
            document.querySelector("#start").disabled = false;
            document.querySelector("#stop").disabled = true;
        };
        
        speechRecognition.onend = () => {
            document.querySelector("#status").style.display = "none";
            console.log("Speech Recognition Ended");
            document.querySelector("#start").disabled = false;
            document.querySelector("#stop").disabled = true;
            
            // Automatically generate mind map when speech recognition ends
            if (final_transcript.trim() !== "") {
                // Redirect to new.html with the transcript as a query parameter
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
            document.querySelector("#final").innerHTML = final_transcript;
            document.querySelector("#interim").innerHTML = interim_transcript;
            
            // Show generate mind map button when there's content
            if (final_transcript.trim() !== "") {
                document.querySelector("#generate-mindmap").style.display = "inline-block";
            }
        };
    } else {
        // Fallback for browsers that don't support speech recognition
        document.querySelector("#start").disabled = true;
        document.querySelector("#stop").disabled = true;
        console.log("Speech Recognition Not Available");
        alert("Speech recognition is not supported in your browser. Please try Chrome or Edge.");
    }

    // Event listeners for buttons
    document.querySelector("#start").onclick = () => {
        if (speechRecognition) {
            speechRecognition.lang = document.querySelector("#select_dialect").value;
            speechRecognition.start();
        }
    };
    
    document.querySelector("#stop").onclick = () => {
        if (speechRecognition) {
            speechRecognition.stop();
        }
    };
    
    // Add auto-start functionality for mind map generation
    // (Button functionality removed as mind map is now auto-generated on speech end)
    const generateMindmapBtn = document.querySelector("#generate-mindmap");
    if (generateMindmapBtn) {
        generateMindmapBtn.style.display = "none";
    }
    
    // Auto-start speech recognition when page loads (optional feature)
    // Uncomment the following lines if you want to auto-start recording on page load
    /*
    setTimeout(() => {
        if (speechRecognition) {
            speechRecognition.lang = document.querySelector("#select_dialect").value;
            speechRecognition.start();
        }
    }, 1000);
    */
    
    document.querySelector("#clear").onclick = () => {
        final_transcript = "";
        document.querySelector("#final").innerHTML = "";
        document.querySelector("#interim").innerHTML = "";
        document.querySelector("#generate-mindmap").style.display = "none";
    };
    
    document.querySelector("#copy").onclick = () => {
        const textToCopy = document.querySelector("#final").innerText;
        if (textToCopy) {
            navigator.clipboard.writeText(textToCopy)
                .then(() => {
                    alert("Text copied to clipboard!");
                })
                .catch(err => {
                    console.error('Failed to copy text: ', err);
                    // Fallback for older browsers
                    const textArea = document.createElement("textarea");
                    textArea.value = textToCopy;
                    document.body.appendChild(textArea);
                    textArea.select();
                    document.execCommand('copy');
                    document.body.removeChild(textArea);
                    alert("Text copied to clipboard!");
                });
        } else {
            alert("No text to copy!");
        }
    };
    
    document.querySelector("#download").onclick = () => {
        const textToDownload = document.querySelector("#final").innerText;
        if (textToDownload) {
            const blob = new Blob([textToDownload], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'speech-to-text.txt';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } else {
            alert("No text to download!");
        }
    };
});
