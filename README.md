# Onboarding Catholizare

Migración del sistema de onboarding Catholizare Pro v5.3 desde Google Apps Script a servidor WordPress.

## Estructura

```
├── gas/
│   └── Code.gs                        # Referencia del GAS backend
├── public/                            # Páginas del profesional
│   ├── Public_Legal.html
│   ├── Public_Perfil.html
│   ├── Public_Dashboard.html
│   └── Public_Upload.html
├── admin/                             # Páginas de administración
│   ├── Admin_Dashboard_Complete.html
│   ├── Admin_Gestion_Usuarios.html
│   ├── Admin_profesionales.html
│   ├── Admin_legal.html
│   ├── Admin_analitica.html
│   ├── Admin_superadmin.html
│   └── Admin_health.html
├── proxy.php                          # Proxy PHP → GAS backend
└── .gitignore
```

## Cómo funciona

1. Los archivos HTML se sirven desde WordPress en `profesionales.catholizare.com/catholizare_sistem/onboarding`
2. Las llamadas `google.script.run` se reemplazan por peticiones a `proxy.php?action=NOMBRE`
3. `proxy.php` reenvía las peticiones al Web App del GAS y devuelve la respuesta

## Configuración

Editar `proxy.php` y colocar la URL del Web App de Google Apps Script en `GAS_WEBAPP_URL`.
