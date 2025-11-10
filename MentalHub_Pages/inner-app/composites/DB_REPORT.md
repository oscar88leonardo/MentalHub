## Reporte de cambios y estructura de BD (Ceramic / ComposeDB)

### Alcance
- Actualización del modelo de perfil para soportar roles Terapeuta y Consultante sin modificar los modelos de agendamiento existentes.
- Introducción de perfiles extendidos v2 por rol, referenciando el perfil base actual (`InnerverProfile`).
- Preparación para sustituir el uso de `Huddle01` moviendo la sala (`roomId`) al perfil extendido del terapeuta, sin retirar aún `Huddle01`.

### Cambios realizados
- Nuevos modelos:
  - `therapistProfileV2.graphql`: Perfil extendido del terapeuta (incluye `roomId` de Huddle).
  - `consultantProfileV2.graphql`: Perfil extendido del consultante (incluye `email` y campos de match).
  - Relaciones inversas desde `InnerverProfile`:
    - `innerverseTherapistV2Profile.graphql` → campo `therapist_v2`.
    - `innerverseConsultantV2Profile.graphql` → campo `consultant_v2`.
- Script de despliegue actualizado: `compose_deploy/composites.mjs` crea e incluye los nuevos composites v2 en el `Composite.from([...])`, y genera `definition.json` / `definition.js` de runtime para la app.
- No se modificaron: `innerverseProfile.graphql` (perfil base), `innerverseHuddle01.graphql`, `innerverseSchedule*.graphql`, `innerverseWorkshop.graphql`.

### Estructura de datos (modelos y relaciones)
- Perfil base (existente):
  - `InnerverProfile`: ancla por DID con campos mínimos transversales (`displayName`, `name`, `rol`, `pfp`). Se mantiene para compatibilidad con agendamiento y workshop actuales.

- Perfiles extendidos por rol (nuevos):
  - `TherapistProfileV2` (1:1 lógico con `InnerverProfile`):
    - Identidad profesional: `fullName`, `degrees`, `licenseNumber`, `licenseJurisdiction`, `licenseCountry`, `yearsExperience`.
    - Práctica clínica: `approaches`, `specialties`, `populations`, `languages`, `primaryLanguage`, `timezone`.
    - Presentación: `bioShort` (<=280), `bioLong` (<=1200), `introVideoUrl`.
    - Tarifas: `priceMin`, `priceMax`, `currency` (enum: ARS, COP, USD, EUR).
    - Estado de recepción: `acceptingNewClients`.
    - Sala de videollamada (Huddle): `roomId`.
  - `ConsultantProfileV2` (1:1 lógico con `InnerverProfile`):
    - Identidad y contexto: `displayName`, `birthDate`, `country`, `city`, `timezone`.
    - Idiomas: `languages`, `primaryLanguage`.
    - Motivo/objetivos: `presentingProblemShort`, `goals` (hasta 3).
    - Preferencias: `therapistGenderPreference`.
    - Presupuesto: `budgetMin`, `budgetMax`, `currency` (ARS, COP, USD, EUR).
    - Contacto y emergencia: `email`, `emergencyContactName`, `emergencyContactPhoneE164`.
    - Consentimientos: `consentTerms`, `consentPrivacy`, `consentTelehealthRisks`, `consentedAt`.
    - Datos sensibles opt‑in: `priorTherapy`, `priorPsychiatry`, `medicationsUsed`, `medicationsNote`, `diagnoses`.

- Relaciones inversas declaradas en `InnerverProfile`:
  - `therapist_v2: [TherapistProfileV2] @relationFrom(...)`
  - `consultant_v2: [ConsultantProfileV2] @relationFrom(...)`
  - Nota: aunque es lista por limitación de `relationFrom`, la expectativa funcional es 1 documento por rol y DID.

- Modelos existentes conservados:
  - `Huddle01`: se mantiene operativo por ahora. Futuro: leer `roomId` desde `TherapistProfileV2`.
  - `Schedule`, `ScheduleTherapist`, `ScheduleProfile`, `SchedHuddle01`: sin cambios.
  - `Workshop`: sin cambios (creador sigue refiriendo a `InnerverProfile`).

### Índices y criterios de búsqueda
- `TherapistProfileV2`:
  - Índices: `primaryLanguage`, `timezone`, `yearsExperience`, `priceMin`, `acceptingNewClients`.
  - Soporta búsquedas por idioma/TZ/experiencia/precio y filtrado de disponibilidad futura (vía modelos de agenda actuales).
- `ConsultantProfileV2`:
  - Índices: `primaryLanguage`, `timezone`, `budgetMin`.
  - Soporta match por idioma/TZ/presupuesto; el resto se filtra en capa de aplicación.

### Privacidad y manejo de PII
- `InnerverProfile` conserva datos mínimos públicos.
- Campos posiblemente sensibles del consultante (ej.: `diagnoses`, `medicationsNote`) modelados como opt‑in y deben tratarse como privados en UI. Para confidencialidad fuerte se recomienda cifrar fuera de ComposeDB y referenciar con un `CID`.

### Estrategia de transición
- Corto plazo: mantener `Huddle01` y agendamiento actual. El `roomId` ya está en `TherapistProfileV2` para comenzar la transición.
- Futuro: actualizar el consumo de sala en la app para leer desde `TherapistProfileV2.roomId` y deprecar `Huddle01` gradualmente.

### Despliegue
- Script: `inner-app/compose_deploy/composites.mjs`.
  - Crea los modelos v2 y añade al `Composite.from([...])`.
  - Genera `my-dapp/src/__generated__/definition.json` y `definition.js`.
  - Ejecutado con éxito: `composite deployed & ready for use`.

### Ubicación de archivos relevantes
- Base:
  - `composites/innerverseProfile.graphql`
- Nuevos:
  - `composites/therapistProfileV2.graphql`
  - `composites/consultantProfileV2.graphql`
  - `composites/innerverseTherapistV2Profile.graphql`
  - `composites/innerverseConsultantV2Profile.graphql`
- Deploy:
  - `compose_deploy/composites.mjs`

---

## Ejemplos de GraphQL (mutations/queries) y relación con perfil base

Los perfiles extendidos v2 referencian al perfil base mediante el campo `profileId` (StreamID de `InnerverProfile`). Flujo típico:
1) Obtener o crear `InnerverProfile` (base).
2) Crear `TherapistProfileV2` o `ConsultantProfileV2` pasando `profileId` del base.
3) Consultar los extendidos desde el base usando las relaciones inversas o por índices.

### 1) Crear (o leer) el perfil base

- Leer el perfil base del usuario autenticado (si ya existe):

```graphql
query GetMyBaseProfile {
  viewer {
    innerverProfile {
      id
      displayName
      name
      rol
      pfp
    }
  }
}
```

- Crear el perfil base (si no existe):

```graphql
mutation CreateBaseProfile {
  createInnerverProfile(
    input: {
      content: {
        displayName: "Nataly (ACT/DBT)"
        name: "Dra. Nataly Mosquera"
        rol: Terapeuta
        pfp: null
      }
    }
  ) {
    document {
      id
    }
  }
}
```

Con el `id` devuelto (ej.: `kjzl6...`), podrás crear los perfiles extendidos usando `profileId`.

### 2) Crear TherapistProfileV2 (incluye roomId de Huddle)

```graphql
mutation CreateTherapistProfileV2 {
  createTherapistProfileV2(
    input: {
      content: {
        profileId: "REEMPLAZAR_CON_ID_DE_InnerverProfile"
        fullName: "Dra. Nataly Mosquera"
        degrees: ["Psicóloga"]
        licenseNumber: "MP 12345"
        licenseJurisdiction: "CABA"
        licenseCountry: "AR"
        yearsExperience: 6
        approaches: ["ACT", "DBT", "Mindfulness"]
        specialties: ["Ansiedad", "TLP", "Autoexigencia"]
        populations: ["Adultos", "Jóvenes 16+"]
        languages: ["Español", "Inglés"]
        primaryLanguage: "Español"
        timezone: "America/Argentina/Buenos_Aires"
        priceMin: 20000
        priceMax: 28000
        currency: ARS
        bioShort: "Psicóloga con enfoque ACT/DBT. Online."
        bioLong: "Integro ACT, DBT y mindfulness..."
        introVideoUrl: null
        acceptingNewClients: true
        roomId: "huddle-room-ABC123"
      }
    }
  ) {
    document {
      id
    }
  }
}
```

Actualizar solo la sala (p. ej., rotación de roomId):

```graphql
mutation UpdateTherapistRoom {
  updateTherapistProfileV2(
    input: {
      id: "REEMPLAZAR_CON_ID_DE_TherapistProfileV2"
      content: { roomId: "huddle-room-XYZ789" }
    }
  ) {
    document {
      id
      roomId
    }
  }
}
```

### 3) Crear ConsultantProfileV2 (incluye email y datos para match)

```graphql
mutation CreateConsultantProfileV2 {
  createConsultantProfileV2(
    input: {
      content: {
        profileId: "REEMPLAZAR_CON_ID_DE_InnerverProfile"
        displayName: "María"
        birthDate: "1997-05-14T00:00:00.000Z"
        country: "AR"
        city: "Buenos Aires"
        timezone: "America/Argentina/Buenos_Aires"
        languages: ["Español"]
        primaryLanguage: "Español"
        presentingProblemShort: "Ansiedad e insomnio."
        goals: ["Dormir 7–8 h", "Reducir rumiación", "Retomar ejercicio"]
        therapistGenderPreference: "F"
        budgetMin: 15000
        budgetMax: 22000
        currency: ARS
        email: "maria@example.com"
        emergencyContactName: "Nilda"
        emergencyContactPhoneE164: "+54911XXXXXXX"
        consentTerms: true
        consentPrivacy: true
        consentTelehealthRisks: true
        consentedAt: "2025-11-06T18:20:00.000Z"
        priorTherapy: true
        priorPsychiatry: false
        medicationsUsed: true
        medicationsNote: "Prefiero hablarlo en sesión"
        diagnoses: ["prefiero-no-decir"]
      }
    }
  ) {
    document {
      id
    }
  }
}
```

### 4) Consultar extendidos desde el perfil base (relaciones inversas)

```graphql
query GetExtendedProfilesFromBase {
  node(id: "REEMPLAZAR_CON_ID_DE_InnerverProfile") {
    ... on InnerverProfile {
      id
      displayName
      rol
      therapist_v2(first: 1) {
        edges {
          node {
            id
            fullName
            languages
            primaryLanguage
            priceMin
            priceMax
            currency
            acceptingNewClients
            roomId
          }
        }
      }
      consultant_v2(first: 1) {
        edges {
          node {
            id
            displayName
            timezone
            primaryLanguage
            budgetMin
            budgetMax
            currency
            email
          }
        }
      }
    }
  }
}
```

### 5) Consultas por índice (búsqueda/match)

- Terapeutas por idioma/TZ y aceptando nuevos consultantes:

```graphql
query SearchTherapists {
  therapistProfileV2Index(
    first: 10
    filters: {
      where: {
        primaryLanguage: { equalTo: "Español" }
        timezone: { equalTo: "America/Argentina/Buenos_Aires" }
        acceptingNewClients: { equalTo: true }
      }
    }
  ) {
    edges {
      node {
        id
        fullName
        approaches
        specialties
        languages
        priceMin
        priceMax
        currency
        profile { id displayName }
      }
    }
  }
}
```

- Consultantes por idioma/TZ y presupuesto mínimo:

```graphql
query SearchConsultants {
  consultantProfileV2Index(
    first: 10
    filters: {
      where: {
        primaryLanguage: { equalTo: "Español" }
        timezone: { equalTo: "America/Argentina/Buenos_Aires" }
        budgetMin: { lessThanOrEqualTo: 25000 }
      }
    }
  ) {
    edges {
      node {
        id
        displayName
        timezone
        primaryLanguage
        budgetMin
        budgetMax
        currency
        profile { id displayName }
      }
    }
  }
}
```

> Nota: Los operadores exactos de filtros pueden variar según la versión del runtime (por ejemplo `equalTo`, `lessThanOrEqualTo`, etc.). Ajustar según el `__generated__/definition.js` vigente.



