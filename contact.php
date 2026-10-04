<?php
/**
 * contact.php — Traitement du formulaire de contact du portfolio Othniel
 * ------------------------------------------------------------------
 * Reçoit les données du formulaire en POST (fetch/AJAX) et envoie un
 * email via la fonction mail() native de PHP (compatible avec la
 * plupart des hébergements mutualisés : OVH, Hostinger, o2switch...).
 *
 * Aucune base de données n'est nécessaire.
 */

header('Content-Type: application/json; charset=utf-8');

// ------------------------------------------------------------------
// Configuration
// ------------------------------------------------------------------
$destinataire = "douanothniel@gmail.com";        // adresse qui reçoit les messages
$sujet_prefixe = "Nouveau message — Portfolio DOVE";

// ------------------------------------------------------------------
// Sécurité de base
// ------------------------------------------------------------------
function repondre($succes, $message) {
    echo json_encode(["success" => $succes, "message" => $message]);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    repondre(false, "Méthode non autorisée.");
}

// Piège à robots (honeypot) : champ invisible qui doit rester vide
if (!empty($_POST['site_web'] ?? '')) {
    // On répond "succès" pour ne pas alerter le bot, mais on n'envoie rien
    repondre(true, "Message envoyé.");
}

// ------------------------------------------------------------------
// Récupération et validation des champs
// ------------------------------------------------------------------
$nom     = trim($_POST['nom'] ?? '');
$email   = trim($_POST['email'] ?? '');
$message = trim($_POST['message'] ?? '');

if ($nom === '' || $email === '' || $message === '') {
    http_response_code(422);
    repondre(false, "Merci de remplir tous les champs.");
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(422);
    repondre(false, "Adresse email invalide.");
}

if (mb_strlen($nom) > 120 || mb_strlen($message) > 5000) {
    http_response_code(422);
    repondre(false, "Le message est trop long.");
}

// Nettoyage simple pour éviter l'injection d'en-têtes email
$nom_propre = str_replace(["\r", "\n"], '', $nom);
$email_propre = str_replace(["\r", "\n"], '', $email);

// ------------------------------------------------------------------
// Construction et envoi de l'email
// ------------------------------------------------------------------
$sujet = "$sujet_prefixe — de $nom_propre";

$corps  = "Nouveau message reçu depuis le formulaire de contact du portfolio.\n\n";
$corps .= "Nom     : $nom_propre\n";
$corps .= "Email   : $email_propre\n";
$corps .= "Date    : " . date('d/m/Y H:i') . "\n";
$corps .= "----------------------------------------\n";
$corps .= $message . "\n";

$entetes  = "From: Portfolio DOVE <no-reply@" . ($_SERVER['HTTP_HOST'] ?? 'localhost') . ">\r\n";
$entetes .= "Reply-To: $email_propre\r\n";
$entetes .= "Content-Type: text/plain; charset=UTF-8\r\n";

$envoye = @mail($destinataire, $sujet, $corps, $entetes);

if ($envoye) {
    repondre(true, "Votre message a bien été envoyé, merci !");
} else {
    http_response_code(500);
    repondre(false, "L'envoi a échoué. Réessayez plus tard ou écrivez directement à $destinataire.");
}
