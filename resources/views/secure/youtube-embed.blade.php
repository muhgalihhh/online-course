<!DOCTYPE html>
<html lang="id">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{ $materialTitle }}</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            background: #000;
            font-family: Arial, sans-serif;
            overflow: hidden;
        }

        .video-container {
            position: relative;
            width: 100%;
            height: 100vh;
        }

        .watermark {
            position: absolute;
            bottom: 20px;
            right: 20px;
            color: {{ $watermark['color'] }};
            font-size: 14px;
            font-weight: bold;
            opacity: {{ $watermark['opacity'] }};
            z-index: 1000;
            pointer-events: none;
            text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.8);
            background: rgba(0, 0, 0, 0.3);
            padding: 5px 10px;
            border-radius: 5px;
        }

        .protection-overlay {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 999;
            pointer-events: none;
        }

        iframe {
            width: 100%;
            height: 100%;
            border: none;
        }

        /* Anti-inspect styles */
        .anti-inspect {
            -webkit-user-select: none;
            -moz-user-select: none;
            -ms-user-select: none;
            user-select: none;
            -webkit-touch-callout: none;
            -webkit-tap-highlight-color: transparent;
        }
    </style>
</head>

<body class="anti-inspect">
    <div class="video-container">
        <iframe
            src="https://www.youtube.com/embed/{{ $videoId }}?rel=0&showinfo=0&modestbranding=1&fs=1&cc_load_policy=0&iv_load_policy=3&autohide=1&controls=1&disablekb=1"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowfullscreen>
        </iframe>

        <div class="protection-overlay"></div>

        <div class="watermark">
            {{ $watermark['text'] }}
        </div>
    </div>

    <script>
        // Ringan: hanya blok aksi umum tanpa redirect yang menyebabkan layar putih
        (function() {
            'use strict';

            const prevent = (e) => {
                e.preventDefault();
                return false;
            };
            document.addEventListener('contextmenu', prevent);
            document.addEventListener('dragstart', prevent);
            document.addEventListener('selectstart', prevent);
            document.addEventListener('keydown', function(e) {
                // F12 / Ctrl+Shift+I/J/C / Ctrl+U / Ctrl+S
                if (e.keyCode === 123 ||
                    (e.ctrlKey && e.shiftKey && [73, 74, 67].includes(e.keyCode)) ||
                    (e.ctrlKey && [83, 85].includes(e.keyCode))) {
                    prevent(e);
                }
            });

            // Opsional: tampilkan watermark berkedip ringan jika kehilangan fokus (tidak blur penuh)
            window.addEventListener('blur', () => {
                const wm = document.querySelector('.watermark');
                if (wm) wm.style.opacity = '0.9';
            });
            window.addEventListener('focus', () => {
                const wm = document.querySelector('.watermark');
                if (wm) wm.style.opacity = '{{ $watermark['opacity'] }}';
            });
        })();
    </script>
</body>

</html>
