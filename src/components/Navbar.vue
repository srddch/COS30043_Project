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
          <li class="nav-item">
            <router-link class="nav-link" to="/courses">Courses</router-link>
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