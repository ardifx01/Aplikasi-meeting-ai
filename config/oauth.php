<?php
/**
 * OAuth Configuration for Spacio Meeting Room Booker
 * Google and Facebook OAuth Integration
 */


// OAuth Scopes
define('GOOGLE_SCOPES', 'email profile');
define('FACEBOOK_SCOPES', 'email public_profile');

// JWT Secret for session tokens
define('JWT_SECRET', 'your_jwt_secret_key_here_change_this_in_production');

// Session configuration
define('SESSION_LIFETIME', 3600); // 1 hour
define('REFRESH_TOKEN_LIFETIME', 2592000); // 30 days

// OAuth State (for security)
function generateOAuthState() {
    return bin2hex(random_bytes(32));
}

function verifyOAuthState($state, $stored_state) {
    return hash_equals($stored_state, $state);
}

// JWT Functions
function generateJWT($payload, $secret = JWT_SECRET, $expiry = SESSION_LIFETIME) {
    $header = json_encode(['typ' => 'JWT', 'alg' => 'HS256']);
    $payload['exp'] = time() + $expiry;
    $payload['iat'] = time();
    
    $base64Header = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($header));
    $base64Payload = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode(json_encode($payload)));
    
    $signature = hash_hmac('sha256', $base64Header . "." . $base64Payload, $secret, true);
    $base64Signature = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($signature));
    
    return $base64Header . "." . $base64Payload . "." . $base64Signature;
}

function verifyJWT($token, $secret = JWT_SECRET) {
    $parts = explode('.', $token);
    if (count($parts) !== 3) {
        return false;
    }
    
    $header = base64_decode(str_replace(['-', '_'], ['+', '/'], $parts[0]));
    $payload = base64_decode(str_replace(['-', '_'], ['+', '/'], $parts[1]));
    $signature = base64_decode(str_replace(['-', '_'], ['+', '/'], $parts[2]));
    
    $expectedSignature = hash_hmac('sha256', $parts[0] . "." . $parts[1], $secret, true);
    
    if (!hash_equals($signature, $expectedSignature)) {
        return false;
    }
    
    $payloadData = json_decode($payload, true);
    if ($payloadData['exp'] < time()) {
        return false;
    }
    
    return $payloadData;
}

// Generate secure tokens
function generateSecureToken($length = 32) {
    return bin2hex(random_bytes($length));
}

function generateRefreshToken() {
    return generateSecureToken(64);
}

// Password hashing
function hashPassword($password) {
    return password_hash($password, PASSWORD_BCRYPT, ['cost' => 12]);
}

function verifyPassword($password, $hash) {
    return password_verify($password, $hash);
}

// Response helpers
function jsonResponse($data, $status = 200) {
    http_response_code($status);
    header('Content-Type: application/json');
    echo json_encode($data);
    exit;
}

function errorResponse($message, $status = 400) {
    jsonResponse(['error' => $message], $status);
}

function successResponse($data, $message = 'Success') {
    jsonResponse(['success' => true, 'message' => $message, 'data' => $data]);
}
?>
