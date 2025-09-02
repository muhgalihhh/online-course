<!DOCTYPE html>
<html>

<head>
    <title>Quick Video Material Creator</title>
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <style>
        body {
            font-family: Arial, sans-serif;
            max-width: 600px;
            margin: 50px auto;
            padding: 20px;
            background: #f5f5f5;
        }

        .form-group {
            margin-bottom: 20px;
        }

        label {
            display: block;
            margin-bottom: 5px;
            font-weight: bold;
        }

        input,
        select,
        textarea {
            width: 100%;
            padding: 10px;
            border: 1px solid #ddd;
            border-radius: 5px;
            box-sizing: border-box;
        }

        button {
            background: #007cba;
            color: white;
            padding: 12px 30px;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            font-size: 16px;
        }

        button:hover {
            background: #005a87;
        }

        .message {
            padding: 10px;
            margin: 10px 0;
            border-radius: 5px;
        }

        .success {
            background: #d4edda;
            border: 1px solid #c3e6cb;
            color: #155724;
        }

        .error {
            background: #f8d7da;
            border: 1px solid #f5c6cb;
            color: #721c24;
        }

        .info {
            background: #cce7ff;
            border: 1px solid #b3d9ff;
            color: #004085;
        }
    </style>
</head>

<body>
    <h1>Quick Video Material Creator</h1>
    <p class="info">Use this form to quickly create video materials for testing the learn page.</p>

    <div id="message"></div>

    <form id="videoForm">
        <div class="form-group">
            <label for="chapter_id">Chapter:</label>
            <select id="chapter_id" name="chapter_id" required>
                <option value="">Loading chapters...</option>
            </select>
        </div>

        <div class="form-group">
            <label for="title">Material Title:</label>
            <input type="text" id="title" name="title" placeholder="e.g. Introduction Video" required>
        </div>

        <div class="form-group">
            <label for="youtube_url">YouTube URL:</label>
            <input type="url" id="youtube_url" name="youtube_url" placeholder="https://www.youtube.com/watch?v=..."
                required>
        </div>

        <div class="form-group">
            <label for="order">Order (position in chapter):</label>
            <input type="number" id="order" name="order" value="1" min="1" required>
        </div>

        <button type="submit">Create YouTube Material</button>
    </form>

    <script>
        // Load chapters
        fetch('/quick-admin-video')
            .then(response => response.json())
            .then(data => {
                const select = document.getElementById('chapter_id');
                select.innerHTML = '<option value="">Select a chapter</option>';

                data.courses.forEach(course => {
                    course.chapters.forEach(chapter => {
                        const option = document.createElement('option');
                        option.value = chapter.id;
                        option.textContent =
                            `${course.title} - ${chapter.title} (${chapter.materials_count} materials)`;
                        select.appendChild(option);
                    });
                });
            })
            .catch(error => {
                console.error('Error loading chapters:', error);
                document.getElementById('message').innerHTML =
                    '<div class="error">Error loading chapters. Please check if you\'re logged in as admin.</div>';
            });

        // Handle form submission
        document.getElementById('videoForm').addEventListener('submit', function(e) {
            e.preventDefault();

            const formData = new FormData(this);
            const data = Object.fromEntries(formData.entries());

            // Get CSRF token
            const token = document.querySelector('meta[name="csrf-token"]').getAttribute('content');

            fetch('/quick-create-youtube', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN': token
                    },
                    body: JSON.stringify(data)
                })
                .then(response => response.json())
                .then(result => {
                    if (result.success) {
                        document.getElementById('message').innerHTML =
                            `<div class="success">${result.message}<br>Material ID: ${result.material.id}</div>`;
                        this.reset();
                    } else {
                        document.getElementById('message').innerHTML =
                            `<div class="error">Error: ${result.error || 'Unknown error'}</div>`;
                    }
                })
                .catch(error => {
                    console.error('Error:', error);
                    document.getElementById('message').innerHTML =
                        '<div class="error">Error creating material. Please check console for details.</div>';
                });
        });
    </script>
</body>

</html>
