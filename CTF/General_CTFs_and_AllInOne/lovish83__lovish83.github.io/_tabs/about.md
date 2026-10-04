---
# the default layout is 'page'
icon: fas fa-info-circle
order: 4
---

Hey, You lost your way pal ```.```<br><br>

<p><span class="color-cycle">Author: Hui_0_07</span></p>

<style>
  /* Default color cycle for light theme */
  @keyframes colorCycleLight {
    0% { color: #FF4500; }   /* Neon Orange */
    25% { color: #00FF00; }  /* Neon Green */
    50% { color: #0000FF; }  /* Neon Blue */
    75% { color: #FFFF00; }  /* Neon Yellow */
    100% { color: #FF4500; } /* Back to Neon Orange */
  }

  /* Color cycle for dark theme */
  @keyframes colorCycleDark {
    0% { color: #FFD700; }   /* Gold */
    25% { color: #FF1493; }  /* Deep Pink */
    50% { color: #8A2BE2; }  /* Blue Violet */
    75% { color: #00FFFF; }  /* Cyan */
    100% { color: #FFD700; } /* Back to Gold */
  }

  /* Apply the light theme color cycle by default */
  .color-cycle {
    animation: colorCycleLight 5s infinite;
  }

  /* For dark theme, change the color cycle */
  @media (prefers-color-scheme: dark) {
    .color-cycle {
      animation: colorCycleDark 5s infinite;
    }
  }
</style>
