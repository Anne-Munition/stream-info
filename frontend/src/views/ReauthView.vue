<template>
  <section class="reauth-view">
    <div class="reauth-shell">
      <div class="reauth-copy">
        <div class="hero-row">
          <div class="hero-copy">
            <div class="eyebrow">Twitch Authorization Required</div>
            <h1 class="title">Your broadcaster token needs attention.</h1>
            <p class="lead">
              Twitch rejected the stored broadcaster token with a 401 response.
              Reauthorize once to refresh the live token and save it for future
              restarts.
            </p>
          </div>

          <div class="art-card">
            <v-img class="art-image" :src="peepoHey" alt="peepoHey" height="190" contain />
          </div>
        </div>

        <div class="details">
          <div class="detail-item">
            <span class="detail-label">Why this happened</span>
            <span class="detail-value">The token is expired, revoked, or missing required scope approval.</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">What reauth does</span>
            <span class="detail-value">It sends you through Twitch login and stores the updated broadcaster token on return.</span>
          </div>
        </div>
        <div v-if="route.query.error" class="error-banner" role="alert">
          Reauthorization failed. Verify the Twitch account is allowed and that
          the requested scopes were approved.
        </div>
        <div class="actions">
          <v-btn color="primary" size="x-large" @click="reauth">
            Reauthorize Twitch Token
          </v-btn>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router';
import peepoHey from '@/assets/images/peepoHey.gif';

const route = useRoute();

function reauth() {
  window.location.href = '/api/auth/reauth';
}
</script>

<style scoped>
.reauth-view {
  min-height: calc(100vh - 2rem);
  display: grid;
  place-items: center;
  padding: 1.5rem;
}

.reauth-shell {
  width: min(100%, 920px);
}

.reauth-copy {
  background: linear-gradient(180deg, rgba(43, 45, 49, 0.96), rgba(24, 25, 28, 0.96));
  border: 1px solid rgba(249, 215, 26, 0.2);
  border-radius: 22px;
  box-shadow: 0 20px 56px rgba(0, 0, 0, 0.32);
  padding: 1.5rem;
  color: #fff;
}

.hero-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 220px;
  gap: 1.25rem;
  align-items: center;
}

.hero-copy {
  min-width: 0;
}

.eyebrow {
  display: inline-block;
  margin-bottom: 0.85rem;
  padding: 0.3rem 0.7rem;
  border-radius: 999px;
  background: rgba(249, 215, 26, 0.14);
  color: #f9d71a;
  font-size: 0.74rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.title {
  margin: 0;
  font-size: clamp(2rem, 4vw, 3.2rem);
  line-height: 1.02;
}

.lead {
  max-width: 32rem;
  margin: 1rem 0 0;
  color: rgba(255, 255, 255, 0.84);
  font-size: 0.98rem;
  line-height: 1.6;
}

.details {
  display: grid;
  gap: 0.85rem;
  margin-top: 1.4rem;
}

.detail-item {
  display: grid;
  gap: 0.35rem;
  padding: 0.9rem 1rem;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 14px;
}

.detail-label {
  color: #f9d71a;
  font-size: 0.82rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.detail-value {
  color: rgba(255, 255, 255, 0.82);
  font-size: 0.96rem;
  line-height: 1.45;
}

.error-banner {
  margin-top: 1.2rem;
  padding: 0.9rem 1rem;
  border: 1px solid rgba(var(--v-theme-error), 0.45);
  border-radius: 14px;
  background: rgba(var(--v-theme-error), 0.12);
  color: rgb(var(--v-theme-error));
  font-size: 0.96rem;
  line-height: 1.45;
}

.actions {
  margin-top: 1.4rem;
}

.art-card {
  width: min(100%, 220px);
  aspect-ratio: 1 / 1;
  display: grid;
  place-items: center;
  justify-self: end;
  padding: 1rem;
  border-radius: 22px;
  background:
    radial-gradient(circle at top, rgba(249, 215, 26, 0.22), transparent 45%),
    linear-gradient(160deg, rgba(61, 123, 166, 0.22), rgba(30, 31, 34, 0.92));
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 14px 36px rgba(0, 0, 0, 0.26);
}

.art-image {
  width: 100%;
}

@media (max-width: 900px) {
  .hero-row {
    grid-template-columns: 1fr 180px;
    gap: 1rem;
  }

  .reauth-copy {
    padding: 1.25rem;
  }

  .art-card {
    width: min(100%, 180px);
  }
}

@media (max-width: 600px) {
  .reauth-view {
    padding: 1rem;
  }

  .hero-row {
    grid-template-columns: 1fr;
  }

  .art-card {
    justify-self: start;
    width: min(100%, 150px);
  }

  .title {
    font-size: 1.85rem;
  }

  .lead,
  .detail-value,
  .error-banner {
    font-size: 0.92rem;
  }

  .actions :deep(.v-btn) {
    width: 100%;
  }
}
</style>
