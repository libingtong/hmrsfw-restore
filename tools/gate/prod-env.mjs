// Imported first by gate.mjs: the Vue compiler packages pick their dev or prod build from NODE_ENV the first time they
// are loaded and stay cached, so production mode must be set before anything (self-check, Vite) loads them. A dev
// compiler emits <!--v-if--> placeholders and keeps template comments; the real build does not.
process.env.NODE_ENV = "production";
