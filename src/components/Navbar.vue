<script setup>
import { selectionStore } from '../store/selection'
</script>

<template>
  <nav class="navbar navbar-expand-lg navbar-dark bg-dark shadow-sm">
    <div class="container">
      <router-link class="navbar-brand fw-bold" to="/">SmartCanvas</router-link>
      
      <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
        <span class="navbar-toggler-icon"></span>
      </button>

      <div class="collapse navbar-collapse" id="navbarNav">
        <ul class="navbar-nav me-auto">
     
          <li class="nav-item">
            <router-link class="nav-link" to="/">Home</router-link>
          </li>
          
          <!-- Courses Dropdown with Hover functionality -->
          <li class="nav-item dropdown course-dropdown">
            <a class="nav-link dropdown-toggle d-flex align-items-center" href="#" id="navbarDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
              Courses
              <span v-if="selectionStore.enrolledUnits.length > 0" class="badge bg-primary ms-2 rounded-pill small">
                {{ selectionStore.enrolledUnits.length }}
              </span>
            </a>
            <ul class="dropdown-menu dropdown-menu-dark shadow" aria-labelledby="navbarDropdown">
              <li>
                <router-link class="dropdown-item py-2" to="/courses">
                  Course Catalogue
                </router-link>
              </li>
              <li>
                <router-link class="dropdown-item py-2 d-flex justify-content-between align-items-center" to="/my-selection">
                  <span>My Selection</span>
                  <span v-if="selectionStore.enrolledUnits.length > 0" class="badge bg-primary rounded-pill ms-2">
                    {{ selectionStore.enrolledUnits.length }}
                  </span>
                </router-link>
              </li>
            </ul>
          </li>

          <li class="nav-item dropdown">
  <a
    class="nav-link dropdown-toggle"
    href="#"
    id="socialDropdown"
    role="button"
    data-bs-toggle="dropdown"
    aria-expanded="false"
  >
    Social
  </a>

  <ul class="dropdown-menu dropdown-menu-dark shadow">

    <li>
      <RouterLink
        class="dropdown-item py-2"
        to="/social/likes"
      >
        Likes & Favourites
      </RouterLink>
    </li>

    <li>
      <RouterLink
        class="dropdown-item py-2"
        to="/social/ratings"
      >
        My Ratings
      </RouterLink>
    </li>

    <li>
      <RouterLink
        class="dropdown-item py-2"
        to="/social/schedule"
      >
        Auto Schedule
      </RouterLink>
    </li>

    <li>
      <RouterLink
        class="dropdown-item py-2"
        to="/social/dashboard"
      >
        Activity Dashboard
      </RouterLink>
    </li>

  </ul>
</li>
          <li class="nav-item">
            <router-link class="nav-link" to="/forum">Forum</router-link>
          </li>
          <li class="nav-item">
            <router-link class="nav-link" to="/schedule">My Schedule</router-link>
          </li>
        </ul>
        
        <div class="d-flex">
          <router-link to="/login" class="btn btn-outline-light btn-sm">Login</router-link>
        </div>
      </div>
    </div>
  </nav>
</template>

<style scoped>
.badge {
  font-size: 0.65rem;
  padding: 0.35em 0.65em;
}

/* CSS for Hover Dropdown functionality */
@media (min-width: 992px) {
  .course-dropdown:hover .dropdown-menu {
    display: block;
    margin-top: 0; /* remove the gap so hover doesn't flicker */
  }
}

.dropdown-item {
  font-size: 0.9rem;
  transition: background-color 0.2s;
}

.dropdown-item:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.dropdown-menu {
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 8px;
  padding: 0.5rem 0;
}
</style>
