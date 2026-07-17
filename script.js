const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll('.reveal').forEach((element) => {
  if (reduceMotion) element.classList.add('visible');
  else observer.observe(element);
});

const formatTime = (seconds) => {
  if (!Number.isFinite(seconds)) return '00:00';
  return `00:${String(Math.floor(seconds)).padStart(2, '0')}`;
};

document.querySelectorAll('[data-sync-group]').forEach((group) => {
  const videos = [...group.querySelectorAll('video')];
  const button = group.querySelector('.play-button');
  const progress = group.querySelector('.timeline i');
  const clock = group.querySelector('time');
  let frame;

  const update = () => {
    const leader = videos[0];
    if (leader.duration) progress.style.width = `${(leader.currentTime / leader.duration) * 100}%`;
    clock.textContent = formatTime(leader.currentTime);
    videos.slice(1).forEach((video) => {
      if (Math.abs(video.currentTime - leader.currentTime) > 0.12) video.currentTime = leader.currentTime;
    });
    if (!leader.paused) frame = requestAnimationFrame(update);
  };

  button.addEventListener('click', async () => {
    if (videos[0].paused) {
      videos.slice(1).forEach((video) => { video.currentTime = videos[0].currentTime; });
      await Promise.all(videos.map((video) => video.play()));
      group.classList.add('is-playing');
      update();
    } else {
      videos.forEach((video) => video.pause());
      group.classList.remove('is-playing');
      cancelAnimationFrame(frame);
    }
  });

  videos[0].addEventListener('ended', () => {
    videos.forEach((video) => { video.currentTime = 0; });
  });
});

document.querySelectorAll('[data-video-toggle]').forEach((button) => {
  const video = document.getElementById(button.dataset.videoToggle);
  button.addEventListener('click', async () => {
    if (video.paused) {
      await video.play();
      button.innerHTML = '<span>Ⅱ</span> Pause continuous generation';
    } else {
      video.pause();
      button.innerHTML = '<span>▶</span> Play continuous generation';
    }
  });
});

