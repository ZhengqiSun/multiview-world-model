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

const comparison = document.getElementById('comparison');
if (comparison) {
  const sourceRoot = 'assets/video/selected-20260905/';
  const frameRoot = `${sourceRoot}qualitative-abc-7methods-20260914/`;
  const figureRoot = `${sourceRoot}qualitative-20260914/`;
  const caseNames = { A: 'Shared map geometry', B: 'Player position and visibility', C: 'Large camera turns' };
  const methodNames = { gt: 'Ground truth', base: 'LingBot-World Base', ours: 'SyncWorld' };
  const state = { scene: 'B', time: 3, viewIndex: 1 };

  fetch(`${frameRoot}manifest.json`)
    .then((response) => {
      if (!response.ok) throw new Error(`Comparison manifest: ${response.status}`);
      return response.json();
    })
    .then((manifest) => {
      const frames = new Map(manifest.frames.map((frame) => [
        [frame.case, frame.time_seconds, frame.view, frame.method_id].join(':'), frame
      ]));
      const views = Object.fromEntries(Object.keys(caseNames).map((scene) => [
        scene,
        [...new Set(manifest.frames
          .filter((frame) => frame.case === scene && frame.time_seconds === 1 && frame.method_id === 'gt')
          .map((frame) => frame.view))]
      ]));

      const renderComparison = () => {
        const view = views[state.scene][state.viewIndex];
        if (!view) return;
        for (const method of Object.keys(methodNames)) {
          const frame = frames.get([state.scene, state.time, view, method].join(':'));
          if (!frame) return;
          const link = comparison.querySelector(`[data-frame="${method}"]`);
          const image = link.querySelector('img');
          const path = `${frameRoot}${frame.frame_path}`;
          link.href = path;
          image.src = path;
          image.alt = `${methodNames[method]}, ${caseNames[state.scene]}, ${view.replace('_', '/').toUpperCase()}, ${state.time} seconds`;
        }
        comparison.querySelector('#comparison-context').textContent =
          `${state.scene} · ${caseNames[state.scene]} / ${view.toUpperCase().replace('_', '/')} / ${state.time} seconds`;
        comparison.querySelector('#comparison-figure').href = `${figureRoot}${state.scene}-comparison.png`;
        comparison.querySelectorAll('[data-control="case"] button').forEach((button) => {
          button.setAttribute('aria-pressed', String(button.dataset.value === state.scene));
        });
        comparison.querySelectorAll('[data-control="time"] button').forEach((button) => {
          button.setAttribute('aria-pressed', String(Number(button.dataset.value) === state.time));
        });
        comparison.querySelectorAll('[data-control="view"] button').forEach((button) => {
          button.setAttribute('aria-pressed', String(Number(button.dataset.value) === state.viewIndex));
        });
      };

      comparison.querySelectorAll('[data-control] button').forEach((button) => {
        button.addEventListener('click', () => {
          const control = button.parentElement.dataset.control;
          if (control === 'case') {
            state.scene = button.dataset.value;
            state.viewIndex = 0;
          } else if (control === 'time') {
            state.time = Number(button.dataset.value);
          } else {
            state.viewIndex = Number(button.dataset.value);
          }
          renderComparison();
        });
      });
      renderComparison();
    })
    .catch(() => {
      comparison.querySelector('#comparison-context').textContent =
        'The frame selector needs a local web server. The default comparison and source gallery remain available.';
    });
}
