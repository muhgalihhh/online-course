<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>Test YouTube Material Form</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 20px;
        }

        .form-group {
            margin-bottom: 15px;
        }

        label {
            display: block;
            margin-bottom: 5px;
            font-weight: bold;
        }

        input,
        select {
            width: 300px;
            padding: 8px;
            border: 1px solid #ccc;
            border-radius: 4px;
        }

        button {
            background: #007cba;
            color: white;
            padding: 10px 20px;
            border: none;
            border-radius: 4px;
            cursor: pointer;
        }

        .message {
            padding: 10px;
            margin: 10px 0;
            border-radius: 4px;
        }

        .success {
            background: #d4edda;
            color: #155724;
            border: 1px solid #c3e6cb;
        }

        .error {
            background: #f8d7da;
            color: #721c24;
            border: 1px solid #f5c6cb;
        }
    </style>
</head>

<body>
    <h1>Test YouTube Material Creation</h1>

    @if (session('success'))
        <div class="message success">{{ session('success') }}</div>
    @endif

    @if (session('error'))
        <div class="message error">{{ session('error') }}</div>
    @endif

    <form action="/test-youtube-submit" method="POST">
        @csrf

        <div class="form-group">
            <label for="chapter_id">Chapter:</label>
            <select name="chapter_id" id="chapter_id" required>
                <option value="">Select Chapter</option>
                @foreach ($chapters as $chapter)
                    <option value="{{ $chapter->id }}">{{ $chapter->title }} (Course: {{ $chapter->course->title }})
                    </option>
                @endforeach
            </select>
        </div>

        <div class="form-group">
            <label for="title">Title:</label>
            <input type="text" name="title" id="title" value="Test YouTube Video from Browser" required>
        </div>

        <div class="form-group">
            <label for="order">Order:</label>
            <input type="number" name="order" id="order" value="999" required>
        </div>

        <div class="form-group">
            <label for="type">Type:</label>
            <select name="type" id="type" required>
                <option value="video_youtube" selected>Video YouTube</option>
            </select>
        </div>

        <div class="form-group">
            <label for="youtube_url">YouTube URL:</label>
            <input type="url" name="youtube_url" id="youtube_url"
                value="https://www.youtube.com/watch?v=dQw4w9WgXcQ" required>
        </div>

        <button type="submit">Create Material</button>
    </form>

    <h2>Debug Info</h2>
    <p><strong>CSRF Token:</strong> {{ csrf_token() }}</p>
    <p><strong>Chapters Available:</strong> {{ count($chapters) }}</p>

    <h3>Test Admin Form</h3>
    <form action="/admin/materials" method="POST">
        @csrf

        <div class="form-group">
            <label for="admin_chapter_id">Chapter:</label>
            <select name="chapter_id" id="admin_chapter_id" required>
                <option value="">Select Chapter</option>
                @foreach ($chapters as $chapter)
                    <option value="{{ $chapter->id }}">{{ $chapter->title }} (Course: {{ $chapter->course->title }})
                    </option>
                @endforeach
            </select>
        </div>

        <div class="form-group">
            <label for="admin_title">Title:</label>
            <input type="text" name="title" id="admin_title" value="Test YouTube from Admin Route" required>
        </div>

        <div class="form-group">
            <label for="admin_order">Order:</label>
            <input type="number" name="order" id="admin_order" value="999" required>
        </div>

        <div class="form-group">
            <label for="admin_type">Type:</label>
            <select name="type" id="admin_type" required>
                <option value="video_youtube" selected>Video YouTube</option>
            </select>
        </div>

        <div class="form-group">
            <label for="admin_youtube_url">YouTube URL:</label>
            <input type="url" name="youtube_url" id="admin_youtube_url"
                value="https://www.youtube.com/watch?v=test-admin" required>
        </div>

        <button type="submit">Create Material via Admin Route</button>
    </form>
</body>

</html>
