<?php

return [
  /*
  |--------------------------------------------------------------------------
  | Video Security Configuration
  |--------------------------------------------------------------------------
  */

  // Token expiration time in minutes
  'token_expiration' => env('VIDEO_TOKEN_EXPIRATION', 120), // 2 hours

  // YouTube embed expiration time in seconds
  'youtube_token_expiration' => env('YOUTUBE_TOKEN_EXPIRATION', 300), // 5 minutes

  // Enable/disable anti-piracy features
  'anti_piracy_enabled' => env('ANTI_PIRACY_ENABLED', true),

  // Watermark configuration
  'watermark' => [
    'enabled' => env('WATERMARK_ENABLED', true),
    'opacity' => env('WATERMARK_OPACITY', 0.7),
    'position' => env('WATERMARK_POSITION', 'bottom-right'), // bottom-right, bottom-left, top-right, top-left
    'color' => env('WATERMARK_COLOR', 'rgba(255, 255, 255, 0.8)'),
  ],

  // DevTools detection
  'devtools_detection' => [
    'enabled' => env('DEVTOOLS_DETECTION_ENABLED', true),
    'redirect_url' => env('DEVTOOLS_REDIRECT_URL', '/courses'),
    'threshold' => env('DEVTOOLS_THRESHOLD', 160), // pixels
  ],

  // Security headers
  'security_headers' => [
    'x_frame_options' => env('X_FRAME_OPTIONS', 'SAMEORIGIN'),
    'x_content_type_options' => env('X_CONTENT_TYPE_OPTIONS', 'nosniff'),
    'x_xss_protection' => env('X_XSS_PROTECTION', '1; mode=block'),
    'referrer_policy' => env('REFERRER_POLICY', 'strict-origin-when-cross-origin'),
  ],

  // Content Security Policy
  'csp' => [
    'frame_ancestors' => env('CSP_FRAME_ANCESTORS', "'self'"),
    'default_src' => env('CSP_DEFAULT_SRC', "'self'"),
    'script_src' => env('CSP_SCRIPT_SRC', "'self' 'unsafe-inline' 'unsafe-eval' https://*.youtube.com https://*.google.com"),
    'frame_src' => env('CSP_FRAME_SRC', "'self' https://*.youtube.com"),
    'img_src' => env('CSP_IMG_SRC', "'self' data: https:"),
    'media_src' => env('CSP_MEDIA_SRC', "'self' blob:"),
    'style_src' => env('CSP_STYLE_SRC', "'self' 'unsafe-inline'"),
  ],

  // Video streaming
  'streaming' => [
    'chunk_size' => env('VIDEO_CHUNK_SIZE', 8192), // bytes
    'buffer_size' => env('VIDEO_BUFFER_SIZE', 1024000), // 1MB
    'range_support' => env('VIDEO_RANGE_SUPPORT', true),
  ],

  // Rate limiting for video access
  'rate_limiting' => [
    'enabled' => env('VIDEO_RATE_LIMITING_ENABLED', true),
    'max_requests' => env('VIDEO_MAX_REQUESTS', 60), // per minute
    'decay_minutes' => env('VIDEO_RATE_DECAY', 1),
  ],

  // Logging
  'logging' => [
    'enabled' => env('VIDEO_SECURITY_LOGGING', true),
    'log_channel' => env('VIDEO_LOG_CHANNEL', 'single'),
    'log_suspicious_activity' => env('LOG_SUSPICIOUS_ACTIVITY', true),
  ],

  // User agent detection
  'user_agent_filtering' => [
    'enabled' => env('USER_AGENT_FILTERING_ENABLED', true),
    'blocked_patterns' => [
      'curl',
      'wget',
      'python',
      'scrapy',
      'bot',
      'spider',
      'crawler',
    ],
  ],

  // IP restrictions (optional)
  'ip_restrictions' => [
    'enabled' => env('IP_RESTRICTIONS_ENABLED', false),
    'whitelist' => explode(',', env('IP_WHITELIST', '')),
    'blacklist' => explode(',', env('IP_BLACKLIST', '')),
  ],
];
