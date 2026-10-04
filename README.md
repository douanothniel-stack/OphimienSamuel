# Portfolio Othniel — DOVE

## Lancer en local (front uniquement)
Ouvre `index.html` dans un navigateur moderne. Le formulaire de contact ne
fonctionnera pas en local (voir ci-dessous) : il faut un serveur PHP.

## Photo
Ajoute ta photo dans `assets/photo.jpg`.

## CV
Ajoute ton CV (PDF) dans `assets/cv.pdf` pour que le bouton
« Télécharger mon CV » fonctionne.

## Structure
- `index.html` : contenu du portfolio
- `style.css` : design, responsive, animations CSS
- `script.js` : particules, effet machine à écrire, menu, formulaire
- `contact.php` : backend PHP qui envoie les messages du formulaire par email

## Backend (formulaire de contact)

Le formulaire envoie ses données en `POST` vers `contact.php`, qui utilise
la fonction `mail()` native de PHP pour envoyer un email à
`douanothniel@gmail.com`. Il inclut :
- une validation des champs (nom, email, message) ;
- un champ piège anti-robot (« honeypot ») invisible ;
- un nettoyage basique contre l'injection d'en-têtes email ;
- une réponse JSON (`success` / `message`) lue par `script.js` pour afficher
  un retour visuel sous le formulaire.

### Déploiement
1. Héberge l'ensemble du dossier (y compris `contact.php`) sur un serveur
   qui supporte PHP (OVH, Hostinger, o2switch, InfinityFree, etc.).
   `contact.php` ne fonctionnera pas sur un hébergement 100% statique
   (GitHub Pages, Netlify simple, Vercel statique...).
2. Vérifie que la fonction `mail()` est activée chez ton hébergeur — c'est
   le cas par défaut chez la plupart des hébergeurs mutualisés français.
3. Si les emails n'arrivent pas (fréquent avec `mail()` sur certains
   hébergeurs à cause du SPF/DKIM), remplace l'envoi dans `contact.php`
   par PHPMailer + SMTP (ton hébergeur fournit en général un serveur SMTP
   et des identifiants).
4. Pour changer l'adresse de réception, modifie la variable
   `$destinataire` en haut de `contact.php`.

Le fond animé (particules) et les animations sont entièrement gérés côté
client : aucune configuration supplémentaire n'est nécessaire pour eux.

## Effets ajoutés (fx.css / fx.js)
- `fx.css` + `fx.js` sont partagés par TOUTES les pages (accueil, services, projets).
- Écran d'ouverture « bon mood hien » : le texte se change en haut de `fx.js` (variable `LOADER_TEXT`).
- Mode clair « vitrine de glace » : bouton soleil/lune dans l'en-tête, choix mémorisé.
- Brisure au clic : cartes Services et Projets (sélecteur dans `fx.js`, fonction `onClick`).
- Lueur de la souris : mode sombre uniquement (classe `.fx-glow` dans `fx.css`).
- Menu : trois barres → croix, panneau plein écran (Échap pour fermer).
