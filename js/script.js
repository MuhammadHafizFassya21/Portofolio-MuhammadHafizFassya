// ===== Sidebar Logic =====
const sidebar = document.getElementById('sidebar');
const mobileOverlay = document.getElementById('mobile-overlay');

// ===== CV Dropdown Logic =====
const cvDropdownBtn = document.getElementById('cv-dropdown-btn');
const cvDropdownMenu = document.getElementById('cv-dropdown-menu');

if (cvDropdownBtn && cvDropdownMenu) {
  const toggleDropdown = (show) => {
    const isExpanded = show ?? (cvDropdownBtn.getAttribute('aria-expanded') === 'true');
    const nextState = !isExpanded;

    cvDropdownBtn.setAttribute('aria-expanded', nextState);
    cvDropdownMenu.classList.toggle('show', nextState);
  };

  cvDropdownBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleDropdown();
  });

  // Close on click outside
  document.addEventListener('click', (e) => {
    if (!cvDropdownBtn.contains(e.target) && !cvDropdownMenu.contains(e.target)) {
      cvDropdownBtn.setAttribute('aria-expanded', 'false');
      cvDropdownMenu.classList.remove('show');
    }
  });

  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      cvDropdownBtn.setAttribute('aria-expanded', 'false');
      cvDropdownMenu.classList.remove('show');
    }
  });

  // Close after clicking an item
  cvDropdownMenu.querySelectorAll('a').forEach(item => {
    item.addEventListener('click', () => {
      cvDropdownBtn.setAttribute('aria-expanded', 'false');
      cvDropdownMenu.classList.remove('show');
    });
  });
}

// Global toggle function
window.toggleSidebar = function () {
  if (sidebar && mobileOverlay) {
    const isClosed = sidebar.classList.contains('-translate-x-full');

    if (isClosed) {
      // Open
      sidebar.classList.remove('-translate-x-full');
      mobileOverlay.classList.remove('hidden');
      setTimeout(() => {
        mobileOverlay.classList.remove('opacity-0');
      }, 10);
    } else {
      // Close
      sidebar.classList.add('-translate-x-full');
      mobileOverlay.classList.add('opacity-0');
      setTimeout(() => {
        mobileOverlay.classList.add('hidden');
      }, 300);
    }
  }
};

// Close sidebar when clicking a link on mobile
const navLinks = document.querySelectorAll('.nav-item');
navLinks.forEach(link => {
  link.addEventListener('click', () => {
    if (window.innerWidth < 1024) { // Close on mobile and tablet
      // Manual close call to ensure correct state
      sidebar.classList.add('-translate-x-full');
      mobileOverlay.classList.add('opacity-0');
      setTimeout(() => {
        mobileOverlay.classList.add('hidden');
      }, 300);
    }
  });
});

// ===== Smooth Scrolling =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', (e) => {
    const targetId = anchor.getAttribute('href');
    const target = document.querySelector(targetId);
    if (!target) return;
    e.preventDefault();
    target.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'nearest' });
  });
});

// ===== Active Navigation on Scroll =====
const sections = document.querySelectorAll('section');
window.addEventListener('scroll', () => {
  let current = '';
  const offset = 150; // Increased offset for better trigger timing

  sections.forEach(section => {
    const sectionTop = section.offsetTop;
    const sectionHeight = section.clientHeight;
    if (window.scrollY >= (sectionTop - offset) && window.scrollY < (sectionTop + sectionHeight - offset)) {
      current = section.getAttribute('id');
    }
  });

  navLinks.forEach(link => {
    // Basic state reset
    link.classList.remove('active-nav', 'bg-[#1a1f2e]', 'text-[#00ff88]');
    link.classList.add('text-[#94a3b8]');

    // Icon scale reset
    const icon = link.querySelector('i');
    if (icon) icon.classList.remove('scale-110');

    // Indicator reset (the green bar)
    const indicator = link.querySelector('div.absolute');
    if (indicator) indicator.classList.remove('opacity-100');

    const href = link.getAttribute('href');
    if (current && href === `#${current}`) {
      // Active state
      link.classList.add('active-nav', 'bg-[#1a1f2e]', 'text-[#00ff88]');
      link.classList.remove('text-[#94a3b8]');
      if (icon) icon.classList.add('scale-110');
      if (indicator) indicator.classList.add('opacity-100');
    }
  });
});

// ===== Scroll Reveal Animation =====
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    entry.target.style.opacity = '1';
    entry.target.style.transform = 'translateY(0)';
  });
}, { threshold: 0.1, rootMargin: '0px 0px -100px 0px' });

document.querySelectorAll('.skill-card, .portfolio-card, .about-content, .edu-card')
  .forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'all 0.6s ease';
    observer.observe(el);
  });

// ===== Typing Effect for Hero Title =====
const highlight = document.querySelector('.highlight');
if (highlight) {
  const text = highlight.textContent;
  highlight.textContent = '';
  let i = 0;

  function typeWriter() {
    if (i >= text.length) return;
    highlight.textContent += text.charAt(i);
    i += 1;
    setTimeout(typeWriter, 100);
  }

  setTimeout(typeWriter, 500);
}

// ===== Contact Form (Formspree) =====
const contactForm = document.getElementById('contactForm');
const successMessage = document.getElementById('successMessage');
const errorMessage = document.getElementById('errorMessage');

if (contactForm && successMessage && errorMessage) {
  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    successMessage.style.display = 'none';
    errorMessage.style.display = 'none';

    const submitBtn = contactForm.querySelector('button[type="submit"]');
    const btnText = submitBtn?.querySelector('.btn-text');
    const originalText = btnText ? btnText.textContent : '';

    if (btnText) btnText.textContent = 'Mengirim...';
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.style.opacity = '0.6';
      submitBtn.style.cursor = 'not-allowed';
    }

    try {
      const formData = new FormData(contactForm);
      const res = await fetch(contactForm.action, {
        method: 'POST',
        body: formData,
        headers: { 'Accept': 'application/json' }
      });

      if (res.ok) {
        successMessage.style.display = 'flex';
        contactForm.reset();
        successMessage.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        setTimeout(() => { successMessage.style.display = 'none'; }, 8000);
      } else {
        errorMessage.style.display = 'flex';
        errorMessage.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        setTimeout(() => { errorMessage.style.display = 'none'; }, 8000);
      }
    } catch (err) {
      errorMessage.style.display = 'flex';
      errorMessage.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      console.error('Error:', err);
      setTimeout(() => { errorMessage.style.display = 'none'; }, 8000);
    } finally {
      if (btnText) btnText.textContent = originalText;
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.style.opacity = '1';
        submitBtn.style.cursor = 'pointer';
      }
    }
  });
}

// ===== Modal Preview Certificates =====
const certModal = document.getElementById('certModal');
if (certModal) {
  const modalImg = certModal.querySelector('.cert-modal-img');
  const modalTitle = certModal.querySelector('.cert-modal-title');
  const modalClose = certModal.querySelector('.cert-modal-close');
  const modalBackdrop = certModal.querySelector('.cert-modal-backdrop');

  const openModal = (title, imgSrc) => {
    if (!modalImg || !modalTitle) return;
    modalTitle.textContent = title;
    modalImg.src = imgSrc;
    modalImg.alt = title;
    certModal.classList.add('open');
    document.body.style.overflow = 'hidden';
  };

  const closeModal = () => {
    certModal.classList.remove('open');
    document.body.style.overflow = '';
  };

  document.querySelectorAll('[data-cert-modal]').forEach(btn => {
    btn.addEventListener('click', () => {
      const title = btn.getAttribute('data-cert-title') || 'Certificate';
      const img = btn.getAttribute('data-cert-img') || '';
      openModal(title, img);
    });
  });

  [modalClose, modalBackdrop].forEach(el => el?.addEventListener('click', closeModal));

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && certModal.classList.contains('open')) closeModal();
  });
}

// ===== Modern Certificates Slider =====
const certSlider = document.getElementById('cert-slider');
const certNextMobile = document.getElementById('cert-next-mobile');
const certNextDesktop = document.getElementById('cert-next-desktop');
const certPrevDesktop = document.getElementById('cert-prev-desktop');

if (certSlider) {
  const scrollAmount = 320; // Scroll increment

  const scrollSlider = (direction) => {
    certSlider.scrollBy({
      left: direction * scrollAmount,
      behavior: 'smooth'
    });
  };

  certNextMobile?.addEventListener('click', () => scrollSlider(1));
  certNextDesktop?.addEventListener('click', () => scrollSlider(1));
  certPrevDesktop?.addEventListener('click', () => scrollSlider(-1));

  // Optional: Auto-hide mobile next button when reaching end
  certSlider.addEventListener('scroll', () => {
    if (certSlider.scrollLeft + certSlider.clientWidth >= certSlider.scrollWidth - 10) {
      certNextMobile?.classList.add('opacity-0', 'pointer-events-none');
    } else {
      certNextMobile?.classList.remove('opacity-0', 'pointer-events-none');
    }
  });
}

// ===== Fade-in Certificates =====
const fadeSection = document.querySelector('.cert-section.fade-section');
const fadeItems = document.querySelectorAll('.cert-card.fade-item');

if (fadeSection) {
  const sectionObserver = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('visible');
      obs.unobserve(entry.target);
    });
  }, { threshold: 0.25 });

  sectionObserver.observe(fadeSection);
}

if (fadeItems.length) {
  const itemObserver = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('visible');
      obs.unobserve(entry.target);
    });
  }, { threshold: 0.2 });

  fadeItems.forEach(item => itemObserver.observe(item));
}


// ===== Live Clock =====
function updateClock() {
  const clockEls = document.querySelectorAll('.digital-clock');
  const dateEls = document.querySelectorAll('.date-display');

  if (clockEls.length === 0 && dateEls.length === 0) return;

  const now = new Date();

  // Time: 00:00:00
  const timeStr = now.toLocaleTimeString('en-GB', { 
    hour: '2-digit', 
    minute: '2-digit', 
    second: '2-digit', 
    hour12: false 
  });
  clockEls.forEach(el => el.textContent = timeStr);

  // Date: MON, JAN 01
  const dateStr = now.toLocaleDateString('en-US', { 
    weekday: 'short', 
    month: 'short', 
    day: '2-digit' 
  }).toUpperCase();
  dateEls.forEach(el => el.textContent = dateStr);
}
setInterval(updateClock, 1000);
updateClock(); // Initial call

// ===== Projects Filter (New Tailwind Design) =====
const filterBtns = document.querySelectorAll('.filter-btn');
const projectCards = document.querySelectorAll('.project-card');

if (filterBtns.length > 0) {
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const filter = btn.dataset.filter;

      // Update active state
      filterBtns.forEach(b => {
        b.classList.remove('active');
        b.style.backgroundColor = '#1a1f2e';
        b.style.color = '#94a3b8';
        b.setAttribute('aria-pressed', 'false');
      });

      btn.classList.add('active');
      btn.style.backgroundColor = '#00ff88';
      btn.style.color = '#0b0f14';
      btn.setAttribute('aria-pressed', 'true');

      // Filter projects
      projectCards.forEach(card => {
        if (filter === 'all' || card.dataset.category === filter) {
          card.classList.remove('project-hidden');
          setTimeout(() => {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
          }, 10);
        } else {
          card.style.opacity = '0';
          card.style.transform = 'translateY(20px)';
          setTimeout(() => {
            card.classList.add('project-hidden');
          }, 300);
        }
      });
    });
  });
}

// ===== Project Modal =====
const projectData = {
  'medcare-insight': {
    title: 'MedCare Insight',
    description: 'MedCare Insight adalah platform skrining kesehatan berbasis AI yang dirancang untuk mendeteksi dini risiko penyakit GERD. Website ini membantu pengguna melakukan deteksi mandiri berdasarkan gejala klinis dan kebiasaan gaya hidup melalui pengolahan data medis yang cerdas dan intuitif.',
    features: [
      'Interactive Screening Form validated with Zod',
      'AI-Powered Risk Analysis (SVC Model)',
      'Risk Factor Visualization with Recharts',
      'Educational Dashboard with model metrics'
    ],
    tech: ['Next.js 14', 'TypeScript', 'Tailwind CSS', 'FastAPI', 'Scikit-learn', 'Recharts'],
    github: 'https://github.com/MuhammadHafizFassya21',
    demo: 'https://gerd-svc.vercel.app/',
    isLiveDemo: true,
    screenshots: ['images/gerd clasification.PNG'],
    architecture: {
      diagram: [
        { name: 'Frontend', icon: 'fab fa-react', tech: 'Next.js 14' },
        { name: 'API Layer', icon: 'fas fa-server', tech: 'FastAPI' },
        { name: 'ML Engine', icon: 'fas fa-brain', tech: 'SVC Model' }
      ],
      dataFlow: [
        'User fills screening form with physical symptoms',
        'Data validated via Zod and sent to FastAPI backend',
        'ML model processes features and returns risk level',
        'Results visualized with Recharts on dashboard'
      ],
      techDecisions: {
        why: [
          'Next.js for interactive and SEO-friendly frontend',
          'FastAPI for high-performance Python backend',
          'SVC model for high accuracy clinical classification'
        ],
        tradeOff: 'Standalone API requires separate hosting or serverless configuration',
        next: 'Expand dataset to include more gastrointestinal conditions'
      }
    }
  },
  'data-engineer-planner': {
    title: 'Data Engineer Study Planner',
    description: 'Data Engineer Study Planner adalah platform pembelajaran terstruktur yang dirancang khusus untuk membantu calon Data Engineer menguasai roadmap teknis dari level dasar hingga tingkat lanjut.',
    features: [
      'Structured Roadmap: Python, SQL, Cloud, dbt, Airflow, Spark, Kafka',
      'Gamified Dashboard with rank system',
      'Interactive Analytics for weekly study stats',
      'Curated Resources and external links',
      'Adaptive Expertise Tracking skill radar'
    ],
    tech: ['Next.js 15+', 'React 19', 'TypeScript', 'Tailwind CSS 4', 'Framer Motion', 'Recharts'],
    github: 'https://github.com/MuhammadHafizFassya21',
    screenshots: ['images/data engineer study planner.PNG'],
    architecture: {
      diagram: [
        { name: 'Core', icon: 'fab fa-react', tech: 'Next.js 15/React 19' },
        { name: 'Styling', icon: 'fas fa-paint-brush', tech: 'Tailwind CSS 4' },
        { name: 'Visualization', icon: 'fas fa-chart-pie', tech: 'Recharts' },
        { name: 'Persistence', icon: 'fas fa-save', tech: 'localStorage' }
      ],
      dataFlow: [
        'User navigates through structured roadmap modules',
        'Progress tracked instantly via localStorage (No backend needed)',
        'Learning analytics updated in real-time on dashboard',
        'Gamification engine calculates rank based on completed nodes'
      ],
      techDecisions: {
        why: [
          'Next.js App Router for modern SPA experience',
          'Framer Motion for smooth gamified transitions',
          'localStorage for zero-latency progress tracking'
        ],
        tradeOff: 'localStorage limits multi-device sync without cloud integration',
        next: 'Add Firebase Auth for cross-platform progress synchronization'
      }
    }
  },
  'catatan-kuliah': {
    title: 'Catatan Kuliah Digital',
    description: 'Catatan Kuliah Digital adalah aplikasi pencatatan berbasis web yang dirancang untuk membantu mahasiswa mengorganisir materi kuliah secara efisien dengan fokus pada kemudahan akses dan produktivitas.',
    features: [
      'Sinkronisasi cloud 24/7 real-time',
      'Pengelompokan per mata kuliah',
      'Sistem login (Google & Email)',
      'Manajemen deadline tugas',
      'Dukungan Dark Mode'
    ],
    tech: ['HTML5', 'CSS3', 'JavaScript', 'Firebase Firestore', 'Firebase Auth'],
    github: 'https://github.com/MuhammadHafizFassya21',
    screenshots: ['images/catatan kuliah.PNG'],
    architecture: {
      diagram: [
        { name: 'UI', icon: 'fab fa-js-square', tech: 'Native JS/HTML5' },
        { name: 'Storage', icon: 'fas fa-cloud-upload-alt', tech: 'Firestore' },
        { name: 'Auth', icon: 'fas fa-user-lock', tech: 'Firebase Auth' }
      ],
      dataFlow: [
        'User authenticates via Firebase Auth',
        'Notes created/edited in the browser',
        'Data synced instantly to Firestore cloud database',
        'Real-time listeners update UI on all connected devices'
      ],
      techDecisions: {
        why: [
          'Native JS for lightweight performance',
          'Firebase for easy real-time synchronization',
          'CSS Variables for robust theme switching (Dark Mode)'
        ],
        tradeOff: 'Native JS requires manually managing DOM states vs React',
        next: 'Mobile-first PWA implementation for offline note taking'
      }
    }
  },
  'diamond-analytics-hub': {
    title: 'Diamond Analytics Hub',
    description: 'Real-time automation from Raw Ingestion to Analytical Warehouse. Includes pipeline health monitoring, audit trail, trend insights, and forecasting alerts.',
    features: [
      'Real-time Data Ingestion & Automation',
      'End-to-End ETL Pipeline',
      'Pipeline Health & Monitoring Dashboard',
      'Detailed Audit Trail & Run Logs',
      'Intelligent Trend Insights & Forecasting Alerts'
    ],
    tech: ['Python', 'Streamlit', 'SQL', 'Pandas', 'ETL', 'Data Warehouse'],
    github: 'https://github.com/MuhammadHafizFassya21',
    demo: 'https://hafiz-data-engine-n7jwztnazaaledhqnudnx.streamlit.app',
    isLiveDemo: true,
    screenshots: [
      'assets/images/diamond-analytics-hub/dashboard1.PNG',
      'assets/images/diamond-analytics-hub/dashboard2.PNG',
      'assets/images/diamond-analytics-hub/dashboard3.PNG',
      'assets/images/diamond-analytics-hub/system-health.PNG'
    ],
    architecture: {
      diagram: [
        { name: 'Raw Ingestion', icon: 'fas fa-download', tech: 'Python/API' },
        { name: 'Transformation Layer', icon: 'fas fa-cogs', tech: 'Pandas/SQL' },
        { name: 'Analytical Warehouse', icon: 'fas fa-database', tech: 'PostgreSQL' },
        { name: 'Analytics Hub', icon: 'fas fa-chart-line', tech: 'Streamlit' }
      ],
      dataFlow: [
        'Raw data ingested from various sources via Python scripts',
        'Data cleaned, normalized, and transformed in the ETL layer',
        'Processed data stored in the Analytical Data Warehouse',
        'Streamlit dashboard fetches data for real-time visualization'
      ],
      techDecisions: {
        why: [
          'Python for versatile data processing and automation',
          'Streamlit for rapid development of interactive data apps',
          'SQL for robust data management and querying'
        ],
        tradeOff: 'Streamlit may face performance bottlenecks with extremely large datasets without optimization',
        next: 'Implement advanced forecasting models and multi-source cloud integration'
      }
    }
  },
  'chronos-forecast': {
    title: 'Chronos: Time Series Forecasting',
    description: 'A collection of pretrained models for zero-shot probabilistic time series forecasting, leveraging language model architectures to transform time series into tokens.',
    features: [
      'Zero-shot Probabilistic Forecasting',
      'Language Model Architecture (T5)',
      'Quantization of Time Series into Tokens',
      'Probabilistic Quantile Forecasting',
      'Advanced Multivariate Support'
    ],
    tech: ['Python', 'PyTorch', 'HuggingFace', 'Transformers'],
    github: 'https://github.com/MuhammadHafizFassya21/chronos-forecast',
    demo: null,
    isSimulator: false,
    screenshots: ['images/chronos1.PNG'],
    architecture: {
      diagram: [
        { name: 'Time Series', icon: 'fas fa-chart-line', tech: 'Input' },
        { name: 'Quantization', icon: 'fas fa-braille', tech: 'Tokenization' },
        { name: 'T5 Model', icon: 'fas fa-brain', tech: 'Transformers' },
        { name: 'Quantiles', icon: 'fas fa-percentage', tech: 'Output' }
      ],
      dataFlow: [
        'Historical data normalization',
        'Tokenization of values',
        'Transformer-based prediction',
        'De-quantization to values'
      ],
      techDecisions: {
        why: ['State-of-the-art transformer architecture', 'Zero-shot capabilities'],
        tradeOff: 'Higher inference latency',
        next: 'Optimized ONNX export'
      }
    }
  },
  'fraud-detection': {
    title: 'Fraud Detection Mobile Banking (XGBoost)',
    description: 'A comprehensive machine learning solution to detect fraudulent transactions in mobile banking systems using XGBoost algorithm with advanced preprocessing pipeline.',
    features: [
      'Real-time fraud detection with 95% accuracy',
      'Automated preprocessing pipeline for data cleaning',
      'Performance metrics dashboard for model evaluation'
    ],
    tech: ['Python', 'XGBoost', 'Pandas', 'Scikit-learn', 'Matplotlib'],
    github: 'https://github.com/MuhammadHafizFassya21',
    demo: null,
    isSimulator: true,
    architecture: {
      diagram: [
        { name: 'Mobile App', icon: 'fas fa-mobile-alt', tech: 'Client' },
        { name: 'Preprocessing', icon: 'fas fa-cogs', tech: 'Python Pipeline' },
        { name: 'XGBoost Model', icon: 'fas fa-brain', tech: 'Inference' },
        { name: 'Fraud Score', icon: 'fas fa-chart-line', tech: 'Output' }
      ],
      dataFlow: [
        'User initiates transaction via Mobile App',
        'Transaction data sent to Python Preprocessing Pipeline',
        'Cleaned features fed into XGBoost Model',
        'Model returns Fraud Probability Score',
        'App allows or blocks transaction based on threshold'
      ],
      techDecisions: {
        why: [
          'chosen XGBoost for its high performance on structured data',
          'Python used for rich data science ecosystem'
        ],
        tradeOff: 'Latency slightly higher due to complex preprocessing',
        next: 'Implement real-time streaming with Kafka'
      }
    }
  },
  'ai-notebook': {
    title: 'AI Smart Notebook',
    description: 'An intelligent mobile productivity suite that utilizes Large Language Models (LLM) to transform raw meeting notes and ideas into structured summaries, actionable tasks, and organized categories.',
    features: [
      'Neural Text Summarization (OpenAI GPT-4o)',
      'Context-Aware Smart Categorization',
      'Real-time Cloud Synchronization',
      'Multi-modal Input (Voice & Text)',
      'End-to-end Encrypted Note Storage'
    ],
    tech: ['React Native', 'TypeScript', 'Node.js', 'OpenAI SDK', 'Firebase Firestore'],
    github: 'https://github.com/MuhammadHafizFassya21',
    demo: null,
    architecture: {
      diagram: [
        { name: 'React Native', icon: 'fab fa-react', tech: 'Mobile UI' },
        { name: 'API Gateway', icon: 'fas fa-door-open', tech: 'Node.js' },
        { name: 'LLM Engine', icon: 'fas fa-brain', tech: 'GPT-4o-mini' },
        { name: 'Cloud Store', icon: 'fas fa-cloud', tech: 'Firebase DB' }
      ],
      dataFlow: [
        'User captures voice/text via Mobile Interface',
        'Payload securely transmitted to Node.js Middleware',
        'Engine processes content via OpenAI Completion API',
        'Structured JSON response stored in Firebase Firestore',
        'Real-time listeners update UI across all active devices'
      ],
      techDecisions: {
        why: [
          'React Native chosen for 95% code reuse across OS',
          'Firebase provides instant real-time sync without sockets'
        ],
        tradeOff: 'Token consumption management vs latency',
        next: 'Implement local on-device LLM (LLama 3) for offline support'
      }
    }
  },
  'tomato-leaf': {
    title: 'Tomato Leaf Classification (Transfer Learning)',
    description: 'Mobile application for detecting tomato plant diseases using transfer learning with MobileNetV2, optimized for mobile deployment.',
    features: [
      'Real-time disease detection via camera',
      'Transfer learning with MobileNetV2 for accuracy',
      'Offline-capable model for field use'
    ],
    tech: ['TensorFlow', 'MobileNetV2', 'Keras', 'Flutter'],
    github: 'https://github.com/MuhammadHafizFassya21',
    demo: null,
    architecture: {
      diagram: [
        { name: 'Flutter App', icon: 'fas fa-mobile-alt', tech: 'UI/Camera' },
        { name: 'TFLite Model', icon: 'fas fa-microchip', tech: 'On-device AI' },
        { name: 'SQLite', icon: 'fas fa-database', tech: 'Local History' }
      ],
      dataFlow: [
        'User captures tomato leaf image',
        'Image resized and normalized locally',
        'Passed to MobileNetV2 (TFLite) for inference',
        'Prediction result displayed immediately',
        'Result saved to SQLite history'
      ],
      techDecisions: {
        why: [
          'On-device inference for offline capability',
          'MobileNetV2 balanced speed and accuracy'
        ],
        tradeOff: 'Model size impacts app download size',
        next: 'Add cloud sync for expert validation'
      }
    }
  },
  'umkm-app': {
    title: 'UMKM Management App',
    description: 'Mobile application designed to help small business owners manage their operations, inventory, and customer data efficiently.',
    features: [
      'Inventory management system',
      'Customer relationship tracking',
      'Sales analytics dashboard'
    ],
    tech: ['Flutter', 'Dart', 'Firebase', 'SQLite'],
    github: 'https://github.com/MuhammadHafizFassya21',
    demo: null,
    isLiveDemo: true,
    architecture: {
      diagram: [
        { name: 'Flutter UI', icon: 'fas fa-mobile-alt', tech: 'Client' },
        { name: 'Provider', icon: 'fas fa-code-branch', tech: 'State Mgmt' },
        { name: 'Firebase', icon: 'fas fa-cloud', tech: 'Backend/DB' }
      ],
      dataFlow: [
        'Merchant inputs product stock',
        'Provider updates local app state',
        'Data synced to Firestore in background',
        'Orders update inventory naturally'
      ],
      techDecisions: {
        why: [
          'Flutter for rapid UI development',
          'Firebase for scalable backend without maintenance'
        ],
        tradeOff: 'No complex relational queries in NoSQL',
        next: 'Add offline-first architecture with local DB sync'
      }
    }
  },
  'tomato-web': {
    title: 'Tomato Leaf Classification Web',
    description: 'Web-based application for tomato disease classification with an intuitive upload → prediction → results workflow.',
    features: [
      'Drag-and-drop image upload',
      'Instant prediction results',
      'Disease information and treatment recommendations'
    ],
    tech: ['HTML', 'Tailwind CSS', 'JavaScript', 'TensorFlow.js'],
    github: 'https://github.com/MuhammadHafizFassya21',
    demo: null,
    architecture: {
      diagram: [
        { name: 'Browser', icon: 'fab fa-chrome', tech: 'HTML/Tailwind' },
        { name: 'TensorFlow.js', icon: 'fas fa-brain', tech: 'In-browser AI' },
        { name: 'DOM', icon: 'fas fa-code', tech: 'Updates' }
      ],
      dataFlow: [
        'User drops image in browser',
        'TensorFlow.js processes image in client RAM',
        'Prediction generated without server upload',
        'DOM updated with results'
      ],
      techDecisions: {
        why: [
          'Privacy-first (image never leaves device)',
          'Zero server cost for inference'
        ],
        tradeOff: 'Performance depends on user device hardware',
        next: 'Support more disease types'
      }
    }
  },
  'crud-flutter': {
    title: 'Student CRUD App (Flutter)',
    description: 'A clean and simple Flutter application for managing student data with full CRUD (Create, Read, Update, Delete) operations.',
    features: [
      'Complete CRUD operations',
      'Search and filter functionality',
      'Data export to CSV'
    ],
    tech: ['Flutter', 'Dart', 'Firebase', 'Provider'],
    github: 'https://github.com/MuhammadHafizFassya21',
    demo: null,
    isCrudSimulator: true,
    architecture: {
      diagram: [
        { name: 'Flutter App', icon: 'fas fa-mobile-alt', tech: 'UI' },
        { name: 'Controller', icon: 'fas fa-cog', tech: 'Logic' },
        { name: 'Firebase', icon: 'fas fa-fire', tech: 'Firestore' }
      ],
      dataFlow: [
        'User submits student form',
        'Controller validates input',
        'Data sent to Firestore collection',
        'StreamBuilder updates UI automatically'
      ],
      techDecisions: {
        why: [
          'Real-time updates via Firestore Streams',
          'Simple MVC separation'
        ],
        tradeOff: 'Tightly coupled to Firebase SDK',
        next: 'Refactor to Clean Architecture'
      }
    }
  },
  'dashboard-traffic': {
    title: 'Personal Portfolio Analytics Dashboard',
    description: 'Real-time analytics dashboard to track portfolio engagement and project activity with dynamic data visualization.',
    features: [
      'Real-time visitor tracking',
      'Interactive charts & data visualization',
      'Project engagement metrics'
    ],
    tech: ['JavaScript', 'Tailwind CSS', 'Node.js'],
    github: 'https://github.com/MuhammadHafizFassya21',
    demo: 'https://dashboard-portofolio-ten.vercel.app/dashboard',
    architecture: {
      diagram: [
        { name: 'React Client', icon: 'fab fa-react', tech: 'Frontend' },
        { name: 'Next.js API', icon: 'fas fa-server', tech: 'Serverless' },
        { name: 'Database', icon: 'fas fa-database', tech: 'Vercel KV/Postgres' }
      ],
      dataFlow: [
        'Visitor views portfolio project',
        'Frontend sends beacon event',
        'Serverless function aggregates stats',
        'Dashboard fetches live metrics via SWR'
      ],
      techDecisions: {
        why: [
          'Next.js for unified frontend/backend',
          'Vercel for zero-config deployment'
        ],
        tradeOff: 'Cold starts on serverless functions',
        next: 'Add specialized analytics for user journey'
      }
    }
  },
  'ai-insight': {
    title: 'AI Insights & Activity Analytics',
    description: 'A cutting-edge AI engine that transforms raw development data into actionable engineering insights. It analyzes GitHub event streams to summarize coding patterns, detect focus areas, and provide strategic career growth recommendations.',
    features: [
      'Activity Synthesis via Gemini 1.5 Pro/Flash',
      'Automated Technical Contribution Analysis',
      'Topic Clustering (Frontend, DevOps, AI)',
      'Dynamic Cyberpunk Analytics Dashboard',
      'Time-Series Filtering (7-Day & 30-Day Windows)'
    ],
    tech: ['Google Gemini API', 'Node.js Serverless', 'GitHub REST API', 'Cyberpunk UI', 'JSON-LD'],
    github: 'https://github.com/MuhammadHafizFassya21',
    demo: 'ai-career.html',
    architecture: {
      diagram: [
        { name: 'GitHub SDK', icon: 'fab fa-github', tech: 'Data Ingestion' },
        { name: 'Edge Worker', icon: 'fas fa-microchip', tech: 'Node.js / API' },
        { name: 'Gemini 1.5', icon: 'fas fa-brain', tech: 'Cognitive Engine' },
        { name: 'Cyberpunk UI', icon: 'fas fa-rocket', tech: 'Analytics Hub' }
      ],
      dataFlow: [
        'Results rendered with specialized cyberpunk-theme controls'
      ],
      techDecisions: {
        why: [
          'Gemini 1.5 Pro for long-context analysis of developer history',
          'Cyberpunk UI for high-visibility dashboard aesthetics'
        ],
        tradeOff: 'Real-time API latency vs data synthesis depth',
        next: 'Add multi-platform activity sync (GitLab/Bitbucket)'
      }
    }
  },
  'aurev-store': {
    title: 'AUREV Store',
    description: 'Modern clothing store website concept with curated product catalog, lookbook, and TikTok-style brand storytelling.',
    features: [
      'Responsive layout (desktop/mobile)',
      'Home hero + brand identity section',
      'Product catalog grid with preview',
      'Lookbook / Gallery showcase',
      'TikTok / Social brand storytelling CTA',
      'Contact & Newsletter integration',
      'Premium hover effects & micro-interactions'
    ],
    tech: ['HTML', 'CSS', 'JavaScript'],
    github: 'https://github.com/MuhammadHafizFassya21',
    demo: 'https://aurev-store.vercel.app/',
    isLiveDemo: true,
    architecture: {
      diagram: [
        { name: 'Navbar', icon: 'fas fa-bars', tech: 'Structure' },
        { name: 'Hero Section', icon: 'fas fa-star', tech: 'Identity' },
        { name: 'Product Grid', icon: 'fas fa-tshirt', tech: 'Catalog' },
        { name: 'Footer', icon: 'fas fa-shoe-prints', tech: 'Info' }
      ],
      dataFlow: [
        'User lands on brand identity hero section',
        'Product catalog displays items via grid component',
        'Gallery section handles brand lookbook imagery',
        'CTA components bridge user to social platforms',
        'Contact logic handles user engagement'
      ],
      techDecisions: {
        why: [
          'Vanilla JS for high-speed interaction overhead',
          'CSS Flex/Grid for responsive layout without heavy frameworks'
        ],
        tradeOff: 'Static catalog requires manual updates',
        next: 'Integrate dynamic product API'
      }
    }
  },
  'ramadhan-planner': {
    title: 'Ramadhan Planner',
    description: 'A dedicated Ramadan productivity suite designed to help users maximize their spiritual journey. It features a holistic approach to productivity with integrated planning, Qur’an tracking, and community features.',
    features: [
      'Ramadhan homepage with daily motivation & quotes',
      'Interactive daily ibadah checklist & planner',
      'Integrated Qur’an reading section with easy navigation',
      'Dynamic Khatam tracker (target vs completed)',
      'Simplified donation section interface',
      'User settings for theme and layout preferences',
      'Fully responsive mobile-first architecture',
      'High-performance UI with smooth transitions'
    ],
    tech: ['HTML', 'CSS', 'JavaScript', 'Vercel'],
    github: 'https://github.com/MuhammadHafizFassya21',
    demo: 'https://ramadhan-plan.vercel.app/',
    isLiveDemo: true,
    architecture: {
      diagram: [
        { name: 'Fixed Sidebar', icon: 'fas fa-bars', tech: 'Navigation' },
        { name: 'Core Modules', icon: 'fas fa-th-large', tech: 'Planner/Quran' },
        { name: 'Local Engine', icon: 'fas fa-database', tech: 'Storage/State' },
        { name: 'Vercel Edge', icon: 'fas fa-cloud', tech: 'Deployment' }
      ],
      dataFlow: [
        'Users interact with various feature modules (Planner, Quran, etc.)',
        'Checklist and progress data persist in localStorage',
        'State management synchronizes updates across UI components',
        'Vercel handles optimized asset delivery and hosting',
        'Mobile-first layout ensures consistency across all devices'
      ],
      techDecisions: {
        why: [
          'Vanilla tech stack for zero-dependency performance',
          'Vercel chosen for seamless CI/CD and edge performance'
        ],
        tradeOff: 'Manual state management vs reactive frameworks',
        next: 'Implement server-side sync for multi-device support'
      }
    }
  },
  'desa-srimahi': {
    title: 'Website Resmi Desa Srimahi',
    description: 'Portal resmi Pemerintah Desa Srimahi yang transparan, informatif, dan melayani. Menyajikan informasi profil desa, data statistik penduduk, pemerintahan, layanan publik, berita desa, dan transparansi anggaran.',
    features: [
      'Profil desa lengkap dengan data statistik penduduk',
      'Informasi pemerintahan desa dan struktur organisasi',
      'Layanan publik dengan akses mudah',
      'Transparansi anggaran desa (APBDes)',
      'Berita dan agenda kegiatan desa',
      'Responsive design untuk semua perangkat'
    ],
    tech: ['React', 'Vite', 'Tailwind CSS', 'Vercel'],
    github: 'https://github.com/MuhammadHafizFassya21',
    demo: 'https://website-desa-srimahi.vercel.app/',
    isLiveDemo: true,
    architecture: {
      diagram: [
        { name: 'React SPA', icon: 'fab fa-react', tech: 'Frontend' },
        { name: 'Vite Build', icon: 'fas fa-bolt', tech: 'Bundler' },
        { name: 'Tailwind', icon: 'fas fa-palette', tech: 'Styling' },
        { name: 'Vercel', icon: 'fas fa-cloud', tech: 'Hosting' }
      ],
      dataFlow: [
        'User mengakses portal desa via browser',
        'React SPA merender halaman profil dan data desa',
        'Tailwind CSS menangani layout responsif',
        'Vercel mendistribusikan aset secara optimal via edge network'
      ],
      techDecisions: {
        why: [
          'React + Vite untuk performa build dan development yang cepat',
          'Tailwind CSS untuk desain responsif yang konsisten dan modern'
        ],
        tradeOff: 'Data statis, perlu update manual untuk informasi terbaru',
        next: 'Integrasi API backend untuk data desa real-time'
      }
    }
  },
  'summary-hafiz': {
    title: 'Portfolio Summary Muhammad Hafiz Fassya',
    description: 'Website ringkasan portofolio dalam 60 detik yang menampilkan keahlian di bidang Data Engineering, AI/ML, dan Web Systems. Dirancang sebagai overview cepat dan profesional dari profil teknis.',
    features: [
      'Ringkasan profil profesional dalam 60 detik',
      'Highlight core focus areas (Data, ML, Web)',
      'Personal branding yang kuat dan modern',
      'Direct links ke Full Portfolio dan GitHub',
      'Desain minimalis dan responsif',
      'Animasi smooth dan interaktif'
    ],
    tech: ['React', 'Vite', 'Tailwind CSS', 'Vercel'],
    github: 'https://github.com/MuhammadHafizFassya21',
    demo: 'https://summary-portofolio.vercel.app/',
    isLiveDemo: true,
    architecture: {
      diagram: [
        { name: 'React SPA', icon: 'fab fa-react', tech: 'Frontend' },
        { name: 'Vite Build', icon: 'fas fa-bolt', tech: 'Bundler' },
        { name: 'Tailwind', icon: 'fas fa-palette', tech: 'Styling' },
        { name: 'Vercel', icon: 'fas fa-cloud', tech: 'Hosting' }
      ],
      dataFlow: [
        'Pengunjung mengakses summary portfolio',
        'React merender ringkasan profil dengan animasi',
        'Highlight area keahlian ditampilkan secara interaktif',
        'CTA mengarahkan ke portofolio lengkap dan GitHub'
      ],
      techDecisions: {
        why: [
          'React untuk komponen dinamis dan animasi yang smooth',
          'Tailwind CSS untuk styling cepat dan konsisten'
        ],
        tradeOff: 'Konten statis, perlu deployment ulang untuk update',
        next: 'Implementasi CMS headless untuk konten dinamis'
      }
    }
  },
  'clipforge': {
    title: 'ClipForge Vertical Clip Generator By Fiz',
    description: 'AI-powered tool yang mengonversi konten video panjang (podcast, interview, dll.) menjadi clip vertikal viral yang dioptimalkan untuk platform media sosial seperti TikTok, Instagram Reels, dan YouTube Shorts.',
    features: [
      'AI engagement identification untuk menemukan momen terbaik',
      'Auto vertical formatting (9:16) untuk media sosial',
      'Generasi clip otomatis 30-60 detik',
      'Upload video dengan antarmuka sederhana',
      'Optimalisasi untuk TikTok, Reels, dan Shorts',
      'Preview dan download hasil clip'
    ],
    tech: ['React', 'Tailwind CSS', 'AI Video API', 'Vercel'],
    github: 'https://github.com/MuhammadHafizFassya21',
    demo: 'https://clip-video-by-fiz.vercel.app/',
    isLiveDemo: true,
    architecture: {
      diagram: [
        { name: 'React UI', icon: 'fab fa-react', tech: 'Frontend' },
        { name: 'Upload Engine', icon: 'fas fa-upload', tech: 'File Handler' },
        { name: 'AI Processor', icon: 'fas fa-brain', tech: 'Video Analysis' },
        { name: 'Clip Output', icon: 'fas fa-film', tech: '9:16 Vertical' }
      ],
      dataFlow: [
        'User mengunggah video panjang ke platform',
        'AI menganalisis konten untuk menemukan highlight',
        'Engine memotong dan memformat ke rasio 9:16',
        'Clip vertikal siap diunduh untuk media sosial'
      ],
      techDecisions: {
        why: [
          'React untuk UI interaktif dan responsive',
          'AI Video API untuk analisis konten otomatis'
        ],
        tradeOff: 'Ketergantungan pada API eksternal untuk pemrosesan video',
        next: 'Tambahkan subtitle otomatis dan overlay branding'
      }
    }
  }
};

function openProjectModal(projectId) {
  const modal = document.getElementById('projectModal');
  const modalContent = document.getElementById('modalContent');
  const project = projectData[projectId];

  if (!project) return;

  // Get current language and texts
  const currentLang = localStorage.getItem('siteLang') || 'default';
  const t = translations[currentLang === 'default' ? 'en' : currentLang] || translations['en'];

  // Helper for safe translation
  const getText = (key, defaultText) => {
    // Traverse object: 'modal.tabs.overview' -> t['modal']['tabs']['overview']
    return key.split('.').reduce((obj, k) => (obj || {})[k], t) || defaultText;
  };

  const idMap = {
    'diamond-analytics-hub': 'diamond',
    'chronos-forecast': 'chronos',
    'fraud-detection': 'fraud',
    'ai-notebook': 'aiNotebook',
    'tomato-leaf': 'tomatoMobile',
    'umkm-app': 'umkm',
    'tomato-web': 'tomatoWeb',
    'crud-flutter': 'crud',
    'dashboard-traffic': 'dashboard',
    'ai-insight': 'aiInsight',
    'aurev-store': 'aurev',
    'ramadhan-planner': 'ramadhan',
    'desa-srimahi': 'srimahi',
    'summary-hafiz': 'summaryHafiz'
  };

  const transKey = idMap[projectId] || projectId.replace(/-([a-z])/g, (g) => g[1]);

  const finalTitle = getText(`project.${transKey}.title`, project.title);
  const finalDesc = getText(`project.${transKey}.desc`, project.description);

  const textOverview = getText('cert.tabs.overview', 'Overview');
  const textArch = getText('cert.tabs.architecture', 'Architecture');

  // Status Badge Logic
  const status = projectStatus[projectId];
  let badgeHtml = '';
  if (status) {
    const badgeText = t.cert && t.cert.badge && t.cert.badge[status] ? t.cert.badge[status] : status;
    badgeHtml = `<span class="health-badge-modal health-badge-${status}">${badgeText}</span>`;
  }

  // Build Architecture HTML if data exists
  let archHtml = '';
  if (project.architecture) {
    const arch = project.architecture;

    // 1. Diagram
    const diagramHtml = arch.diagram.map(node => `
      <div class="arch-node">
        <i class="${node.icon} arch-node-icon"></i>
        <span class="arch-node-title">${node.name}</span>
        <span class="arch-node-tech">${node.tech}</span>
      </div>
    `).join('<div class="arch-arrow"><i class="fas fa-arrow-down"></i></div>');

    // 2. Data Flow
    const dataFlowHtml = arch.dataFlow.map(step => `
      <li class="arch-list-item">${step}</li>
    `).join('');

    // 3. Tech Decisions
    const decisionHtml = `
      <div class="decision-card">
        <h5><i class="fas fa-check-circle"></i> Why this stack?</h5>
        <div class="space-y-1">
          ${arch.techDecisions.why.map(reason => `<p>• ${reason}</p>`).join('')}
        </div>
      </div>
      <div class="decision-card tradeoff">
        <h5><i class="fas fa-exclamation-triangle"></i> Trade-offs</h5>
        <p>${arch.techDecisions.tradeOff}</p>
      </div>
       <div class="decision-card">
         <h5><i class="fas fa-rocket"></i> ${getText('cert.arch.nextSteps', 'Next Steps')}</h5>
        <p>${arch.techDecisions.next}</p>
      </div>
    `;

    archHtml = `
      <div class="arch-grid">
        <div class="arch-diagram-container">
           <h4 class="arch-section-title"><i class="fas fa-sitemap"></i> High-Level Architecture</h4>
           ${diagramHtml}
        </div>
        <div class="arch-details">
          <div>
            <h4 class="arch-section-title"><i class="fas fa-stream"></i> ${getText('cert.arch.dataFlow', 'Data Flow')}</h4>
            <ul class="arch-list">
              ${dataFlowHtml}
            </ul>
          </div>
          <div>
             <h4 class="arch-section-title"><i class="fas fa-lightbulb"></i> ${getText('cert.arch.keyDecisions', 'Key Decisions')}</h4>
             ${decisionHtml}
          </div>
        </div>
      </div>
    `;
  } else {
    archHtml = `<div class="text-center text-slate-400 py-10">Architecture details not available for this project.</div>`;
  }

  // Build Modal Content (Tabs + Views)
  let html = `
    <h3 class="text-2xl sm:text-3xl font-bold mb-2 flex items-center gap-2" style="color: #f8fafc;">
      ${finalTitle}
      ${badgeHtml}
    </h3>
    
    <!-- Tabs -->
    <div class="tab-container">
      <button class="tab-btn active" onclick="switchModalTab('overview')">${textOverview}</button>
      <button class="tab-btn" onclick="switchModalTab('architecture')">${textArch}</button>
    </div>

    <!-- Overview Content -->
    <div id="modal-tab-overview" class="tab-content block animate-fade-in">
      <p class="text-base mb-6" style="color: #94a3b8;">${finalDesc}</p>
      
      ${project.screenshots ? `
      <div class="mb-6">
        <h4 class="text-lg font-semibold mb-3" style="color: #f8fafc;">Project Screenshots</h4>
        <div class="flex gap-4 overflow-x-auto pb-4 custom-scrollbar snap-x">
          ${project.screenshots.map(src => `
            <div class="flex-shrink-0 w-full sm:w-[400px] aspect-video rounded-lg overflow-hidden border border-[#334155] snap-center hover:border-[#00ff88] transition-colors duration-300">
              <img src="${src}" class="w-full h-full object-cover" alt="Project Screenshot" loading="lazy">
            </div>
          `).join('')}
        </div>
        <p class="text-xs text-slate-500 mt-2 flex items-center gap-1">
          <i class="fas fa-info-circle"></i> Scroll horizontally to view all screenshots
        </p>
      </div>
      ` : ''}
      
      <div class="mb-6">
        <h4 class="text-lg font-semibold mb-3" style="color: #f8fafc;">Key Features</h4>
        <ul class="space-y-2">
          ${project.features.map(feature => `
            <li class="flex items-start gap-2">
              <svg class="w-5 h-5 mt-0.5 flex-shrink-0" style="color: #00ff88;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
              </svg>
              <span style="color: #94a3b8;">${feature}</span>
            </li>
          `).join('')}
        </ul>
      </div>
      
      <div class="mb-6">
        <h4 class="text-lg font-semibold mb-3" style="color: #f8fafc;">Tech Stack</h4>
        <div class="flex flex-wrap gap-2">
          ${project.tech.map(tech => `
            <span class="px-3 py-1 rounded-full text-sm font-medium" style="background-color: #0b0f14; color: #94a3b8; border: 1px solid #334155;">
              ${tech}
            </span>
          `).join('')}
        </div>
      </div>
      
      <div class="flex gap-3">
        <a 
          href="${project.github}" 
          target="_blank"
          class="flex-1 px-6 py-3 rounded-lg text-center font-medium transition-colors duration-200 focus:outline-none focus:ring-2"
          style="background-color: #00ff88; color: #0b0f14;">
          <i class="fab fa-github mr-2"></i>View on GitHub
        </a>
        ${project.isLiveDemo ? `
          <button 
            onclick="openLiveDemo('${projectId}')" 
            class="flex-1 px-6 py-3 rounded-lg text-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 hover:bg-[#00ff88] hover:text-[#0b0f14] group"
            style="background-color: transparent; color: #00ff88; border: 1px solid #00ff88;">
            <i class="fas fa-play mr-2 group-hover:animate-pulse"></i>Live Demo
          </button>
        ` : project.isSimulator ? `
          <button 
            onclick="openSimulator()" 
            class="flex-1 px-6 py-3 rounded-lg text-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 hover:bg-[#00ff88] hover:text-[#0b0f14] group"
            style="background-color: transparent; color: #00ff88; border: 1px solid #00ff88;">
            <i class="fas fa-bolt mr-2 group-hover:animate-pulse"></i>Live Demo
          </button>
        ` : project.isCrudSimulator ? `
          <button 
            onclick="openCrudSimulator()" 
            class="flex-1 px-6 py-3 rounded-lg text-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 hover:bg-[#38bdf8] hover:text-[#0b0f14] group"
            style="background-color: transparent; color: #38bdf8; border: 1px solid #38bdf8;">
            <i class="fas fa-users-cog mr-2 group-hover:animate-pulse"></i>Live Demo
          </button>
        ` : project.demo ? `
          <a 
            href="${project.demo}" 
            target="_blank"
            class="flex-1 px-6 py-3 rounded-lg text-center font-medium transition-colors duration-200 focus:outline-none focus:ring-2"
            style="background-color: #0b0f14; color: #94a3b8; border: 1px solid #334155;">
            <i class="fas fa-external-link-alt mr-2"></i>Live Demo
          </a>
        ` : ''}
      </div>
    </div>

    <!-- Architecture Content -->
    <div id="modal-tab-architecture" class="tab-content hidden animate-fade-in">
       ${archHtml}
    </div>
  `;

  modalContent.innerHTML = html;
  modal.classList.remove('hidden');
  modal.classList.add('flex');
  document.body.style.overflow = 'hidden';
}

// Tab Switching Logic
window.switchModalTab = function (tabName) {
  // 1. Update Buttons
  const btns = document.querySelectorAll('.tab-btn');
  btns.forEach(btn => {
    if (btn.getAttribute('onclick').includes(tabName)) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });

  // 2. Update Content
  const contents = document.querySelectorAll('.tab-content');
  contents.forEach(content => {
    if (content.id === `modal-tab-${tabName}`) {
      content.classList.remove('hidden');
      content.classList.add('block');
    } else {
      content.classList.remove('block');
      content.classList.add('hidden');
    }
  });
};

function closeProjectModal() {
  const modal = document.getElementById('projectModal');
  modal.classList.add('hidden');
  modal.classList.remove('flex');
  document.body.style.overflow = '';
}

// Close modal on ESC key
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeProjectModal();
  }
});

// Close modal on backdrop click
const projectModal = document.getElementById('projectModal');
if (projectModal) {
  projectModal.addEventListener('click', (e) => {
    if (e.target.id === 'projectModal') {
      closeProjectModal();
    }
  });
}

// ===== Language Switcher Logic =====
// Project Status Data
const projectStatus = {
  'diamond-analytics-hub': 'active',
  'fraud-detection': 'experimental',
  'ai-notebook': 'active',
  'tomato-leaf': 'maintained',
  'umkm-app': 'active',
  'tomato-web': 'maintained',
  'crud-flutter': 'archived',
  'dashboard-traffic': 'active',
  'ai-insight': 'active',
  'aurev-store': 'active',
  'ramadhan-planner': 'active',
  'desa-srimahi': 'active',
  'summary-hafiz': 'active',
  'clipforge': 'active'
};

const translations = {
  en: {
    role: "Data Engineer Enthusiast",
    nav: {
      home: "Home",
      about: "About",
      education: "Education",
      projects: "Projects",
      certificates: "Certificates",
      contact: "Contact",
      dashboard: "Dashboard Activity",
      hiring: "Technical Summary"
    },
    hero: {
      greeting: "Hello Everyone",
      intro: "I am",
      subtitle: "Data Science & Data Engineering Student | Informatics Student",
      connect: "Let's connect"
    },
    heading: {
      skills: "Tech and Stack",
      about: "About",
      education: "Education",
      projects: "Projects",
      certificates: "Certificates",
      contact: "Contact Me"
    },
    text: {
      skills: "Tools I use for data, engineering, and ML projects.",
      about1: "I am an Informatics student specializing in Data Science and Data Engineering. My main interest is building efficient, structured data processing systems that provide measurable insights.",
      about2: "I have worked on various projects involving machine learning, data classification, and web/mobile application development. I am accustomed to working with Python, SQL, and data analysis tools to turn raw data into implementable solutions.",
      about3: "My current focus is deepening my skills in data engineering, model optimization, and building scalable, production-ready systems.",
      projects: "Selected projects in ML, AI, and Data Engineering"
    },
    btn: {
      cv: "CV",
      viewCV: "View CV",
      downloadCv: "Download CV",
      downloadCV: "Download CV",
      viewDashboard: "View Dashboard Traffic",
      details: "Details",
      send: "Send Message"
    },
    contact: {
      introTitle: "Let's Build Something Meaningful",
      introText: "I am enthusiastic about building scalable data solutions and continuously improving my skills in Data Engineering and Machine Learning. If you have a project, job opportunity, or internship offer, feel free to contact me. I'd love to connect and discuss further.",
      gmail: {
        title: "Stay in Touch",
        desc: "Reach out via email for any inquiries or collaborations.",
        btn: "Go to Gmail"
      },
      instagram: {
        title: "Follow My Journey",
        desc: "Stay updated with my latest posts and stories.",
        btn: "Go to Instagram"
      },
      linkedin: {
        title: "Let's Connect",
        desc: "Connect for collaboration or explore my professional experience.",
        btn: "Go to LinkedIn"
      },
      whatsapp: {
        title: "Quick Chat",
        desc: "Chat directly with me on WhatsApp for fast responses.",
        btn: "Chat on WhatsApp"
      },
      github: {
        title: "Explore the Code",
        desc: "Explore the source code for all my projects on GitHub.",
        btn: "Go to GitHub"
      }
    },
    project: {
      diamond: {
        title: "Diamond Analytics Hub",
        desc: "Real-time automation from Raw Ingestion to Analytical Warehouse. Includes pipeline health monitoring, audit trail, trend insights, and forecasting alerts."
      },
      fraud: {
        title: "Fraud Detection Mobile Banking (XGBoost)",
        desc: "Machine learning model to detect fraudulent transactions with preprocessing pipeline and performance metrics evaluation."
      },
      aiNotebook: {
        title: "Aplikasi Mobile Notebook Berbasis AI",
        desc: "Note-taking app with AI features to summarize ideas, organize notes, and boost productivity."
      },
      tomatoMobile: {
        title: "Tomato Leaf Classification (Transfer Learning)",
        desc: "Mobile app for tomato disease classification using transfer learning, optimized for mobile deployment."
      },
      umkm: {
        title: "UMKM Management App",
        desc: "Mobile application to help small business owners manage basic data and operational workflows efficiently."
      },
      tomatoWeb: {
        title: "Tomato Leaf Classification Web",
        desc: "Web application for tomato leaf classification with upload → prediction → results flow."
      },
      crud: {
        title: "Student CRUD App (Flutter)",
        desc: "Flutter application for managing student data with clean interface and end-to-end CRUD operations."
      },
      dashboard: {
        title: "Personal Portfolio Analytics Dashboard",
        desc: "Real-time analytics dashboard to track portfolio engagement and project activity with dynamic data visualization."
      },
      aiInsight: {
        title: "AI Advisor — Insights Dashboard",
        desc: "AI-powered analytics system integrated into the portfolio that transforms coding activity into professional highlights."
      },
      aurev: {
        title: "AUREV Store (Clothing E-Commerce Landing + Catalog)",
        desc: "Modern clothing store website concept with curated product catalog, lookbook, and TikTok-style brand storytelling."
      },
      ramadhan: {
        title: "Ramadhan Planner",
        desc: "A Ramadan productivity web app with planner, Qur’an reading, khatam tracker, and donation features in a calm dark UI."
      },
      srimahi: {
        title: "Official Srimahi Village Website",
        desc: "Official Srimahi Village Government portal featuring village profile, population statistics, public services, and budget transparency."
      },
      summaryHafiz: {
        title: "Portfolio Summary Muhammad Hafiz Fassya",
        desc: "A 60-second portfolio summary website showcasing expertise in Data Engineering, AI/ML, and Web Systems."
      },
      clipforge: {
        title: "ClipForge Vertical Clip Generator By Fiz",
        desc: "AI-powered tool that converts long-form videos into viral vertical clips optimized for TikTok, Reels, and Shorts."
      },
      chronos: {
        title: "Chronos: Time Series Forecasting",
        desc: "A collection of pretrained models for zero-shot probabilistic time series forecasting, leveraging language model architectures to transform time series into tokens."
      }
    },
    hiring: {
      title: "Technical Summary",
      subtitle: "A concise summary of my qualifications, focus, and value proposition.",
      summaryTitle: "Professional Summary",
      summaryText: "Data Science & Engineering undergraduate with a strong foundation in building scalable data pipelines, ETL processes, and machine learning models. Proficient in Python, SQL, and cloud technologies, with hands-on experience in real-world projects ranging from fraud detection to agricultural AI solutions. Passionate about transforming raw data into actionable insights and optimizing infrastructure for performance and reliability.",
      competenciesTitle: "Core Competencies",
      quickFacts: "Quick Facts",
      ctaTitle: "Ready to hire?",
      ctaText: "Download my CV or schedule a chat.",
      topProjects: "Top Relevant Projects"
    },
    edu: {
      status: {
        now: "Now"
      },
      labels: {
        focus: "Focus Areas",
        coursework: "Relevant Coursework",
        projects: "Key Projects",
        stack: "Technical Stack"
      },
      ubharajaya: {
        name: "Universitas Bhayangkara Jakarta Raya",
        shortName: "Universitas Bhayangkara",
        degree: "S1 Informatika",
        duration: "2023 – Present",
        focus: "Data Engineering fundamentals, ETL pipelines, Database design, & Scalable system architecture.",
        coursework: "Data Structures & Algorithms, Database Systems, Artificial Intelligence, Machine Learning.",
        projects: "Tomato Leaf Classification (MobileNetV2), CRUD App with Auth, & Personal Portfolio.",
        stack: "Python (Pandas, NumPy), SQL (MySQL/PostgreSQL), TensorFlow, Git/GitHub, & Deployment."
      },
      journey: {
        title: "Academic Journey"
      },
      history: {
        sma: "High School (SMA)",
        smp: "Junior High School",
        sd: "Elementary School"
      }
    },
    cert: {
      tag: {
        onlineCourse: "ONLINE COURSE",
        webinar: "ACADEMIC WEBINAR",
        industry: "INDUSTRY EVENT",
        blockchainEvent: "BLOCKCHAIN EVENT",
        workshop: "WORKSHOP",
        practicum: "ACADEMIC PRACTICUM"
      },
      tabs: {
        overview: "Overview",
        architecture: "Architecture"
      },
      arch: {
        dataFlow: "Data Flow",
        keyDecisions: "Key Decisions",
        tradeOffs: "Trade-offs",
        nextSteps: "Next Improvements"
      },
      badge: {
        active: "Active",
        maintained: "Maintained",
        experimental: "Experimental",
        archived: "Archived"
      },
    },
    pipeline: {
      title: "Data Pipeline Simulation",
      desc: "Experience an end-to-end data engineering pipeline simulation. Watch as data flows from ingestion to serving with real-time logs and metrics.",
      infoPanel: {
        title: "About this demo",
        item1: "Simulates a real-time data ingestion & processing flow.",
        item2: "Demonstrates observability with live logs & metrics.",
        item3: "Includes automated quality checks and error handling.",
        item4: "Try 'Simulate Failure' to see self-healing/retry logic."
      },
      node: {
        ingest: "Ingest",
        transform: "Transform",
        validate: "Validate",
        load: "Load",
        serve: "Serve"
      },
      controls: "Controls",
      simulateFail: "Simulate Failure",
      btn: {
        run: "Run Pipeline",
        retry: "Retry"
      },
      metric: {
        rows: "Rows Processed",
        latency: "Latency",
        rejected: "Rejected Rows",
        quality: "Quality Score"
      },
      logs: {
        start: "Starting pipeline execution...",
        ingest: "Connecting to Kafka source 'events-topic'...",
        ingestSuccess: "Ingested {val} raw events.",
        transform: "Running transformations (dedup, normalize)...",
        transformWarn: "Detected {val} duplicate keys. Dropping...",
        transformSuccess: "Transformation complete. {val} rows ready.",
        validate: "Running quality checks (schema, nulls, types)...",
        validateTest1: "TEST: not_null(user_id) PASS (null_rate=0.0%)",
        validateTest2: "TEST: foreign_key(product_id) PASS",
        validateSuccess: "All quality checks passed. Score: {val}",
        validateFail: "Quality Check Failed: null_rate > 5% on 'transaction_amount'.",
        load: "Loading data to Snowflake warehouse...",
        loadSuccess: "Upserted {val} rows to 'FACT_TRANSACTIONS'.",
        loadFail: "Connection timeout: Warehouse unreachable.",
        serve: "Refreshing Looker dashboard cache...",
        serveSuccess: "Dashboard updated. Latency: {val}ms",
        done: "Pipeline run completed successfully."
      },
      summary: {
        success: "Pipeline Success",
        failed: "Pipeline Failed",
        reason: "Failure at step: {step}",
        stat: "{rows} rows loaded · {latency}ms latency"
      }
    },
    // Placeholders
    ph: {
      name: "Your Name",
      email: "Your Email",
      message: "Your Message"
    },
    // Hiring / Technical Summary Extended
    hiring: {
      title: "Technical Summary",
      subtitle: "A concise summary of my qualifications, focus, and value proposition.",
      summaryTitle: "Professional Summary",
      summaryText: "Data Science & Engineering undergraduate with a strong foundation in building scalable data pipelines, ETL processes, and machine learning models. Proficient in Python, SQL, and cloud technologies, with hands-on experience in real-world projects ranging from fraud detection to agricultural AI solutions. Passionate about transforming raw data into actionable insights and optimizing infrastructure for performance and reliability.",
      competenciesTitle: "Core Competencies",
      quickFacts: "Quick Facts",
      ctaTitle: "Ready to hire?",
      ctaText: "Download my CV or schedule a chat.",
      topProjects: "Top Relevant Projects",
      comp: {
        de: "Data Engineering",
        etl: "ETL Pipeline Development",
        sql: "SQL & Database Management",
        dw: "Data Warehousing Concepts",
        ds: "Data Science & ML",
        ml: "Machine Learning (XGBoost)",
        viz: "Data Visualization & Analytics",
        deploy: "Model Deployment"
      },
      facts: {
        role: "Role",
        roleVal: "Data Engineering Student",
        loc: "Location",
        locVal: "Indonesia (Remote OK)",
        avail: "Availability",
        availVal: "Open for Opportunities"
      },
      btn: {
        github: "GitHub",
        linkedin: "LinkedIn",
        download: "Download CV",
        whatsapp: "WhatsApp"
      }
    },
    principles: {
      title: "Engineering Operating Principles",
      subtitle: "How I approach building production-ready systems",
      items: {
        observability: {
          title: "I Design for Observability",
          desc: "I track logs, metrics, and system states to make debugging predictable."
        },
        validate: {
          title: "I Validate Before I Trust",
          desc: "Data quality checks and schema validation come before downstream usage."
        },
        measure: {
          title: "I Optimize After Measuring",
          desc: "Performance decisions are driven by metrics, not assumptions."
        },
        failure: {
          title: "I Handle Failure Explicitly",
          desc: "Systems include controlled error handling and retry logic."
        },
        clarity: {
          title: "I Prefer Clarity Over Complexity",
          desc: "Readable architecture and maintainability come before clever shortcuts."
        },
        systems: {
          title: "I Think in Systems, Not Scripts",
          desc: "I design for lifecycle, scalability, and long-term reliability."
        }
      }
    },
    target: {
      title: "Target Companies",
      subtitle: "Companies I’m aiming for after graduation (Data Engineer track).",
      role: "Data Engineer",
      google: {
        reason: "Build large-scale data platforms and learn best-in-class engineering practices."
      },
      dana: {
        reason: "Work on high-traffic fintech systems and real-time data pipelines."
      },
      bi: {
        reason: "Contribute to national-scale data initiatives and financial stability analytics."
      }
    }
  }, // Close en
  id: {
    role: "Data Engineer Enthusiast",
    nav: {
      home: "Beranda",
      about: "Tentang",
      education: "Pendidikan",
      projects: "Proyek",
      certificates: "Sertifikat",
      contact: "Kontak",
      dashboard: "Dashboard Activity",
      hiring: "Ringkasan Teknis",
      principles: "Prinsip Engineering"
    },
    hero: {
      greeting: "Halo Semuanya",
      intro: "Saya",
      subtitle: "Mahasiswa Data Science & Data Engineering | Mahasiswa Informatika",
      connect: "Mari terhubung"
    },
    heading: {
      skills: "Teknologi & Stack",
      about: "Tentang",
      education: "Pendidikan",
      projects: "Proyek",
      certificates: "Sertifikat",
      contact: "Hubungi Saya"
    },
    text: {
      skills: "Alat yang saya gunakan untuk proyek data, engineering, dan ML.",
      about1: "Saya merupakan mahasiswa Informatika dengan spesialisasi pada Data Science dan Data Engineering. Minat utama saya adalah membangun sistem pengolahan data yang efisien, terstruktur, dan dapat memberikan insight yang terukur.",
      about2: "Saya telah mengerjakan berbagai proyek yang melibatkan machine learning, klasifikasi data, serta pengembangan aplikasi berbasis web dan mobile. Saya terbiasa bekerja dengan Python, SQL, serta tools analisis data untuk mengubah raw data menjadi solusi yang dapat diimplementasikan.",
      about3: "Fokus saya saat ini adalah memperdalam kemampuan dalam data engineering, optimasi model, serta membangun sistem yang scalable dan production-ready.",
      projects: "Proyek pilihan dalam ML, AI, dan Data Engineering"
    },
    btn: {
      cv: "CV",
      viewCV: "Lihat CV",
      downloadCv: "Unduh CV",
      downloadCV: "Unduh CV",
      viewDashboard: "Lihat Trafik Dasbor",
      details: "Detail",
      send: "Kirim Pesan"
    },
    contact: {
      introTitle: "Mari Membangun Sesuatu yang Bermakna",
      introText: "Saya sangat antusias dalam membangun solusi data yang dapat diskala dan terus meningkatkan keterampilan saya dalam Rekayasa Data dan Pembelajaran Mesin. Jika Anda memiliki proyek, peluang kerja, atau tawaran magang, jangan ragu untuk menghubungi saya. Saya senang dapat terhubung dan berdiskusi lebih lanjut.",
      gmail: {
        title: "Tetap Terhubung",
        desc: "Hubungi via email untuk pertanyaan atau kolaborasi.",
        btn: "Buka Gmail"
      },
      instagram: {
        title: "Ikuti Perjalanan Saya",
        desc: "Dapatkan update terbaru tentang postingan dan cerita saya.",
        btn: "Buka Instagram"
      },
      linkedin: {
        title: "Mari Terhubung",
        desc: "Terhubung untuk kolaborasi atau melihat pengalaman profesional saya.",
        btn: "Buka LinkedIn"
      },
      whatsapp: {
        title: "Obrolan Cepat",
        desc: "Chat langsung dengan saya di WhatsApp untuk respons cepat.",
        btn: "Chat di WhatsApp"
      },
      github: {
        title: "Jelajahi Kode",
        desc: "Jelajahi kode sumber untuk semua proyek saya di GitHub.",
        btn: "Buka GitHub"
      }
    },
    project: {
      diamond: {
        title: "Diamond Analytics Hub",
        desc: "Otomasi real-time dari Raw Ingestion ke Analytical Warehouse. Mencakup pemantauan kesehatan pipeline, jejak audit, wawasan tren, dan peringatan prakiraan."
      },
      fraud: {
        title: "Deteksi Penipuan Mobile Banking (XGBoost)",
        desc: "Model machine learning untuk mendeteksi transaksi curang dengan pipeline pra-pemrosesan dan evaluasi metrik performa."
      },
      aiNotebook: {
        title: "Aplikasi Mobile Notebook Berbasis AI",
        desc: "Aplikasi pencatat dengan fitur AI untuk merangkum ide, mengatur catatan, dan meningkatkan produktivitas."
      },
      tomatoMobile: {
        title: "Klasifikasi Daun Tomat (Transfer Learning)",
        desc: "Aplikasi mobile untuk klasifikasi penyakit tomat menggunakan transfer learning, dioptimalkan untuk deployment mobile."
      },
      umkm: {
        title: "Aplikasi Manajemen UMKM",
        desc: "Aplikasi mobile untuk membantu pemilik usaha kecil mengelola data dasar dan alur kerja operasional secara efisien."
      },
      tomatoWeb: {
        title: "Web Klasifikasi Daun Tomat",
        desc: "Aplikasi web untuk klasifikasi daun tomat dengan alur unggah → prediksi → hasil."
      },
      crud: {
        title: "Aplikasi CRUD Siswa (Flutter)",
        desc: "Aplikasi Flutter untuk mengelola data siswa dengan antarmuka bersih dan operasi CRUD menyeluruh."
      },
      dashboard: {
        title: "Dasbor Analitik Portofolio Pribadi",
        desc: "Dasbor analitik real-time untuk melacak keterlibatan portofolio dan aktivitas proyek dengan visualisasi data dinamis."
      },
      aiInsight: {
        title: "AI Advisor — Dasbor Analitik",
        desc: "Sistem analisis bertenaga AI yang terintegrasi ke portofolio untuk mengubah aktivitas coding menjadi sorotan profesional."
      },
      aurev: {
        title: "AUREV Store (Produk Katalog & Landing Page)",
        desc: "Konsep website toko pakaian modern dengan katalog produk, lookbook, dan brand storytelling gaya TikTok."
      },
      ramadhan: {
        title: "Ramadhan Planner",
        desc: "Aplikasi produktivitas Ramadan dengan fitur planner, tadarus Al-Qur'an, pelacak khatam, dan donasi dalam UI gelap yang tenang."
      },
      srimahi: {
        title: "Website Resmi Desa Srimahi",
        desc: "Portal resmi Pemerintah Desa Srimahi yang transparan dan informatif, menyajikan profil desa, data statistik penduduk, layanan publik, dan transparansi anggaran."
      },
      summaryHafiz: {
        title: "Portfolio Summary Muhammad Hafiz Fassya",
        desc: "Website ringkasan portofolio 60 detik yang menampilkan keahlian di bidang Data Engineering, AI/ML, dan Web Systems secara ringkas dan profesional."
      },
      clipforge: {
        title: "ClipForge Vertical Clip Generator By Fiz",
        desc: "Tool bertenaga AI yang mengubah video panjang menjadi clip vertikal viral untuk TikTok, Reels, dan Shorts secara otomatis."
      },
      chronos: {
        title: "Chronos: Peramalan Deret Waktu",
        desc: "Kumpulan model terlatih untuk peramalan deret waktu probabilistik zero-shot, memanfaatkan arsitektur model bahasa untuk mengubah deret waktu menjadi token."
      }
    },
    hiring: {
      title: "Ringkasan Teknis",
      subtitle: "Ringkasan kualifikasi, fokus, dan nilai tambah saya secara singkat.",
      summaryTitle: "Ringkasan Profesional",
      summaryText: "Mahasiswa Data Science & Engineering dengan fondasi kuat dalam membangun pipeline data yang scalable, proses ETL, dan model machine learning. Mahir dalam Python, SQL, dan teknologi cloud, dengan pengalaman langsung dalam proyek nyata mulai dari deteksi penipuan hingga solusi AI pertanian. Bersemangat mengubah data mentah menjadi wawasan yang dapat ditindaklanjuti dan mengoptimalkan infrastruktur untuk performa dan keandalan.",
      competenciesTitle: "Kompetensi Inti",
      quickFacts: "Fakta Singkat",
      ctaTitle: "Siap merekrut?",
      ctaText: "Unduh CV saya atau jadwalkan obrolan.",
      topProjects: "Proyek Relevan Teratas",
      comp: {
        de: "Data Engineering",
        etl: "Pengembangan Pipeline ETL",
        sql: "SQL & Manajemen Database",
        dw: "Konsep Data Warehousing",
        ds: "Data Science & ML",
        ml: "Machine Learning (XGBoost)",
        viz: "Visualisasi Data & Analitik",
        deploy: "Deployment Model"
      },
      facts: {
        role: "Peran",
        roleVal: "Mahasiswa Data Engineering",
        loc: "Lokasi",
        locVal: "Indonesia (Remote OK)",
        avail: "Ketersediaan",
        availVal: "Terbuka untuk Peluang"
      },
      btn: {
        github: "GitHub",
        linkedin: "LinkedIn",
        download: "Unduh CV",
        whatsapp: "WhatsApp"
      }
    },
    cert: {
      tag: {
        onlineCourse: "KURSUS ONLINE",
        webinar: "WEBINAR AKADEMIK",
        industry: "ACARA INDUSTRI",
        blockchainEvent: "ACARA BLOCKCHAIN",
        workshop: "LOKAKARYA",
        practicum: "PRAKTIKUM AKADEMIK"
      },
      tabs: {
        overview: "Ringkasan",
        architecture: "Arsitektur"
      },
      arch: {
        dataFlow: "Alur Data",
        keyDecisions: "Keputusan Utama",
        tradeOffs: "Kompromi (Trade-offs)",
        nextSteps: "Pengembangan Selanjutnya"
      },
      badge: {
        active: "Aktif",
        maintained: "Dirawat",
        experimental: "Eksperimental",
        archived: "Diarsipkan"
      },
    }, // Close cert
    pipeline: {
      title: "Simulasi Data Pipeline",
      desc: "Rasakan simulasi data engineering pipeline dari ujung ke ujung. Lihat bagaimana data mengalir dari ingestion hingga serving dengan log dan metrik realtime.",
      infoPanel: {
        title: "Tentang demo ini",
        item1: "Simulasi alur ingestion & pemrosesan data realtime.",
        item2: "Menunjukkan observabilitas dengan log & metrik live.",
        item3: "Termasuk quality checks otomatis dan penanganan error.",
        item4: "Coba 'Simulasi Error' untuk melihat logika retry."
      },
      node: {
        ingest: "Ingest",
        transform: "Transformasi",
        validate: "Validasi",
        load: "Load",
        serve: "Serve"
      },
      controls: "Kontrol",
      simulateFail: "Simulasi Error",
      btn: {
        run: "Jalankan Pipeline",
        retry: "Coba Lagi"
      },
      metric: {
        rows: "Baris Data",
        latency: "Latensi",
        rejected: "Data Ditolak",
        quality: "Skor Kualitas"
      },
      logs: {
        start: "Memulai eksekusi pipeline...",
        ingest: "Menghubungkan ke source Kafka 'events-topic'...",
        ingestSuccess: "Berhasil ingest {val} event mentah.",
        transform: "Menjalankan transformasi (dedup, normalisasi)...",
        transformWarn: "Terdeteksi {val} kunci duplikat. Menghapus...",
        transformSuccess: "Transformasi selesai. {val} data siap.",
        validate: "Menjalankan quality checks (skema, nulls, tipe)...",
        validateTest1: "TEST: not_null(user_id) PASS (null_rate=0.0%)",
        validateTest2: "TEST: foreign_key(product_id) PASS",
        validateSuccess: "Semua cek kualitas lulus. Skor: {val}",
        validateFail: "Quality Check Gagal: null_rate > 5% pada 'transaction_amount'.",
        load: "Memuat data ke warehouse Snowflake...",
        loadSuccess: "Upsert {val} baris ke 'FACT_TRANSACTIONS'.",
        loadFail: "Koneksi timeout: Warehouse tidak dapat dijangkau.",
        serve: "Refresh cache dashboard Looker...",
        serveSuccess: "Dashboard diperbarui. Latensi: {val}ms",
        done: "Pipeline selesai dengan sukses."
      },
      summary: {
        success: "Pipeline Sukses",
        failed: "Pipeline Gagal",
        reason: "Gagal pada tahap: {step}",
        stat: "{rows} baris dimuat · latensi {latency}ms"
      }
    },
    ph: {
      name: "Nama Anda",
      email: "Email Anda",
      message: "Pesan Anda"
    },
    hiring: {
      title: "Ringkasan Teknis",
      subtitle: "Ringkasan kualifikasi, fokus, dan nilai tambah saya secara singkat.",
      summaryTitle: "Ringkasan Profesional",
      summaryText: "Mahasiswa Data Science & Engineering dengan fondasi kuat dalam membangun pipeline data yang scalable, proses ETL, dan model machine learning. Mahir dalam Python, SQL, dan teknologi cloud, dengan pengalaman langsung dalam proyek nyata mulai dari deteksi penipuan hingga solusi AI pertanian. Bersemangat mengubah data mentah menjadi wawasan yang dapat ditindaklanjuti dan mengoptimalkan infrastruktur untuk performa dan keandalan.",
      competenciesTitle: "Kompetensi Inti",
      quickFacts: "Fakta Singkat",
      ctaTitle: "Siap merekrut?",
      ctaText: "Unduh CV saya atau jadwalkan obrolan.",
      topProjects: "Proyek Relevan Teratas",
      comp: {
        de: "Data Engineering",
        etl: "Pengembangan Pipeline ETL",
        sql: "SQL & Manajemen Database",
        dw: "Konsep Data Warehousing",
        ds: "Data Science & ML",
        ml: "Machine Learning (XGBoost)",
        viz: "Visualisasi Data & Analitik",
        deploy: "Deployment Model"
      },
      facts: {
        role: "Peran",
        roleVal: "Mahasiswa Data Engineering",
        loc: "Lokasi",
        locVal: "Indonesia (Remote OK)",
        avail: "Ketersediaan",
        availVal: "Terbuka untuk Peluang"
      },
      btn: {
        github: "GitHub",
        linkedin: "LinkedIn",
        download: "Unduh CV",
        whatsapp: "WhatsApp"
      }
    },
    edu: {
      status: {
        now: "Sekarang"
      },
      labels: {
        focus: "Area Fokus",
        coursework: "Mata Kuliah Relevan",
        projects: "Proyek Utama",
        stack: "Stack Teknis"
      },
      ubharajaya: {
        name: "Universitas Bhayangkara Jakarta Raya",
        shortName: "Universitas Bhayangkara",
        degree: "S1 Informatika",
        duration: "2023 – Sekarang",
        focus: "Dasar-dasar Data Engineering, pipeline ETL, desain Database, & arsitektur sistem yang Scalable.",
        coursework: "Struktur Data & Algoritma, Sistem Database, Kecerdasan Buatan, Machine Learning.",
        projects: "Klasifikasi Daun Tomat (MobileNetV2), Aplikasi CRUD dengan Auth, & Portofolio Pribadi.",
        stack: "Python (Pandas, NumPy), SQL (MySQL/PostgreSQL), TensorFlow, Git/GitHub, & Deployment."
      },
      journey: {
        title: "Perjalanan Akademik"
      },
      history: {
        sma: "Sekolah Menengah Atas (SMA)",
        smp: "Sekolah Menengah Pertama (SMP)",
        sd: "Sekolah Dasar (SD)"
      }
    },
    principles: {
      title: "Prinsip Operasional Engineering",
      subtitle: "Pendekatan saya dalam membangun sistem siap produksi",
      items: {
        observability: {
          title: "Desain untuk Observabilitas",
          desc: "Saya melacak log, metrik, dan status sistem agar debugging lebih terprediksi."
        },
        validate: {
          title: "Validasi Sebelum Percaya",
          desc: "Pemeriksaan kualitas data dan validasi skema dilakukan sebelum penggunaan lebih lanjut."
        },
        measure: {
          title: "Optimasi Setelah Pengukuran",
          desc: "Keputusan performa didasarkan pada metrik, bukan asumsi tebakan."
        },
        failure: {
          title: "Tangani Kegagalan secara Eksplisit",
          desc: "Sistem mencakup penanganan error terkontrol dan logika retry."
        },
        clarity: {
          title: "Kejelasan di Atas Kompleksitas",
          desc: "Arsitektur yang mudah dibaca dan maintainability lebih utama daripada shortcut cerdas."
        },
        systems: {
          title: "Berpikir Sistem, Bukan Sekadar Skrip",
          desc: "Saya merancang untuk siklus hidup, skalabilitas, dan keandalan angka panjang."
        }
      }
    },
    target: {
      title: "Perusahaan Target",
      subtitle: "Perusahaan yang saya tuju setelah lulus (Jalur Data Engineer).",
      role: "Data Engineer",
      google: {
        reason: "Membangun platform data skala besar dan mempelajari praktik engineering terbaik."
      },
      dana: {
        reason: "Bekerja pada sistem fintech dengan trafik tinggi dan pipeline data real-time."
      },
      bi: {
        reason: "Berkontribusi pada inisiatif data skala nasional dan analitik stabilitas keuangan."
      }
    }
  }
};

document.addEventListener('DOMContentLoaded', () => {
  const langToggle = document.getElementById('langToggle');
  const langMenu = document.getElementById('langMenu');
  const langOptions = document.querySelectorAll('.lang-option');


  if (!langToggle) return;

  // Store original text content for "Default" mode
  const defaultTextMap = new Map();

  // Initialize default map
  document.querySelectorAll('[data-i18n]').forEach(el => {
    defaultTextMap.set(el, el.textContent.trim());
  });

  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    defaultTextMap.set(el, el.getAttribute('placeholder'));
  });

  // Load saved language
  // Load saved language
  const savedLang = localStorage.getItem('siteLang') || 'default';
  updateDropdownUI(savedLang);
  applyLanguage(savedLang);

  // Render Project Badges
  renderProjectBadges(savedLang);

  // Toggle Menu
  langToggle.addEventListener('click', (e) => {
    e.stopPropagation();
    langMenu.classList.toggle('scale-0');
    langMenu.classList.toggle('opacity-0');
  });

  // Close when clicking outside
  document.addEventListener('click', (e) => {
    if (!langToggle.contains(e.target) && !langMenu.contains(e.target)) {
      langMenu.classList.add('scale-0');
      langMenu.classList.add('opacity-0');
    }
  });

  // Handle Selection
  langOptions.forEach(btn => {
    btn.addEventListener('click', () => {
      const lang = btn.getAttribute('data-value');
      localStorage.setItem('siteLang', lang);
      updateDropdownUI(lang);
      applyLanguage(lang);
      renderProjectBadges(lang);

      // Close menu
      langMenu.classList.add('scale-0');
      langMenu.classList.add('opacity-0');
    });
  });

  function updateDropdownUI(lang) {


    // Update active state in dropdown
    langOptions.forEach(btn => {
      const value = btn.getAttribute('data-value');
      const icon = btn.querySelector('.fa-circle');
      const img = btn.querySelector('img');

      if (value === lang) {
        btn.classList.add('text-[#00ff88]', 'bg-[#0b0f14]');
        btn.classList.remove('text-[#94a3b8]');
        if (icon) icon.classList.remove('opacity-0');
        if (img) img.classList.remove('opacity-80');
      } else {
        btn.classList.remove('text-[#00ff88]', 'bg-[#0b0f14]');
        btn.classList.add('text-[#94a3b8]');
        if (icon) icon.classList.add('opacity-0');
        if (img) img.classList.add('opacity-80');
      }
    });
  }

  function applyLanguage(lang) {
    if (lang === 'default') {
      // Restore defaults
      document.querySelectorAll('[data-i18n]').forEach(el => {
        if (defaultTextMap.has(el)) {
          el.textContent = defaultTextMap.get(el);
        }
      });
      document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
        if (defaultTextMap.has(el)) {
          el.setAttribute('placeholder', defaultTextMap.get(el));
        }
      });
      return;
    }

    const t = translations[lang];
    if (!t) return;

    // Update text
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      const val = key.split('.').reduce((obj, k) => obj && obj[k], t);
      if (val) el.textContent = val;
    });

    // Update placeholders
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      const key = el.getAttribute('data-i18n-placeholder');
      const val = key.split('.').reduce((obj, k) => obj && obj[k], t);
      if (val) el.setAttribute('placeholder', val);
    });
  }


});

// ===== Fraud Simulator Logic =====
function openSimulator() {
  const modal = document.getElementById('fraudSimModal');
  const content = document.getElementById('fraudSimContent');
  if (modal && content) {
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    // Animate in
    setTimeout(() => {
      content.classList.remove('scale-95', 'opacity-0');
      content.classList.add('scale-100', 'opacity-100');
    }, 10);
  }
}

function closeSimulator() {
  const modal = document.getElementById('fraudSimModal');
  const content = document.getElementById('fraudSimContent');
  if (modal && content) {
    content.classList.remove('scale-100', 'opacity-100');
    content.classList.add('scale-95', 'opacity-0');
    setTimeout(() => {
      modal.classList.add('hidden');
      modal.classList.remove('flex');
      resetSimulator(); // Reset state on close
    }, 300);
  }
}

function predictFraud() {
  const amount = parseFloat(document.getElementById('fraudAmount').value);
  const type = document.getElementById('fraudTransType').value;
  const time = document.getElementById('fraudTime').value;

  // UI Elements
  const btn = document.getElementById('btnPredict');
  const defaultView = document.getElementById('fraudResultDefault');
  const loadingView = document.getElementById('fraudLoading');
  const resultView = document.getElementById('fraudResultContent');

  if (isNaN(amount)) {
    alert("Please enter a valid transaction amount");
    return;
  }

  // Loading State
  btn.disabled = true;
  btn.style.opacity = '0.7';
  btn.style.cursor = 'not-allowed';

  defaultView.classList.add('hidden');
  resultView.classList.add('hidden');
  loadingView.classList.remove('hidden');
  loadingView.classList.add('flex');

  // Simulate API Delay
  setTimeout(() => {
    loadingView.classList.add('hidden');
    loadingView.classList.remove('flex');
    resultView.classList.remove('hidden');

    // Logic: Rule-based Simulation
    let isFraud = false;
    let confidence = 0;
    let desc = "";

    // Rule: Amount > 5000 AND Transfer AND Night = Fraud
    if (amount > 5000 && type === 'Transfer' && time === 'Night') {
      isFraud = true;
      // Random confidence between 75-95%
      confidence = Math.floor(Math.random() * (95 - 75 + 1)) + 75;
      desc = "Transaction pattern matches known fraud rules (High Amount + Night Time + Transfer Type).";
    } else {
      isFraud = false;
      // Random confidence between 60-85% (Safe score)
      confidence = Math.floor(Math.random() * (85 - 60 + 1)) + 60;
      desc = "Transaction appears normal based on historical patterns and user behavior.";
    }

    // Update UI
    const badge = document.getElementById('fraudBadge');
    const circle = document.getElementById('confidenceCircle');
    const confVal = document.getElementById('confidenceVal');
    const title = document.getElementById('resultTitle');
    const descEl = document.getElementById('resultDesc');

    if (isFraud) {
      badge.className = "inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-bold tracking-wider mb-6 bg-red-500/20 text-red-500 border border-red-500/30";
      badge.innerHTML = '<i class="fas fa-exclamation-triangle"></i> HIGH RISK DETECTED';

      // Update circle color (red)
      circle.style.stroke = '#ef4444';
      circle.classList.remove('text-green-500');
      circle.classList.add('text-red-500');

      title.textContent = "Potential Fraud Detected";
      title.className = "text-white font-semibold mb-2";
    } else {
      badge.className = "inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-bold tracking-wider mb-6 bg-green-500/20 text-green-500 border border-green-500/30";
      badge.innerHTML = '<i class="fas fa-shield-alt"></i> TRANSACTION SAFE';

      // Update circle color (green)
      circle.style.stroke = '#00ff88';
      circle.classList.remove('text-red-500');
      circle.classList.add('text-green-500');

      title.textContent = "Transaction Safe";
      title.className = "text-white font-semibold mb-2";
    }

    descEl.textContent = desc;
    confVal.textContent = confidence + "%";

    // Animate Circle
    // Circumference = 2 * PI * 70 ≈ 440
    // Dashoffset = 440 - (440 * percentage / 100)
    // We want to fill the circle proportional to confidence
    const offset = 440 - (440 * confidence / 100);

    // Reset first
    circle.style.strokeDashoffset = 440;

    // Small delay to trigger animation
    setTimeout(() => {
      circle.style.strokeDashoffset = offset;
    }, 50);

    // Reset Button
    btn.disabled = false;
    btn.style.opacity = '1';
    btn.style.cursor = 'pointer';

  }, 1000);
}

function resetSimulator() {
  document.getElementById('fraudAmount').value = '';
  document.getElementById('fraudTransType').value = 'Payment';

  const defaultView = document.getElementById('fraudResultDefault');
  const resultView = document.getElementById('fraudResultContent');
  const loadingView = document.getElementById('fraudLoading');

  if (defaultView) defaultView.classList.remove('hidden');
  if (resultView) resultView.classList.add('hidden');
  if (loadingView) {
    loadingView.classList.add('hidden');
    loadingView.classList.remove('flex');
  }

  // Reset circle animation
  const circle = document.getElementById('confidenceCircle');
  if (circle) circle.style.strokeDashoffset = 440;
}

// ===== Student CRUD Simulator Logic =====
let students = [
  { id: 1, name: "Kevin Chandra Manafe", nim: "202310715315", major: "Teknik Industri" },
  { id: 2, name: "Muhammad Hafiz", nim: "202310715190", major: "Informatika" },
  { id: 3, name: "Hera Abila", nim: "202310717171", major: "Informatika" },
  { id: 4, name: "Budi Santoso", nim: "202310715123", major: "Sistem Informasi" },
  { id: 5, name: "Siti Aminah", nim: "202310715456", major: "Akuntansi" }
];

function openCrudSimulator() {
  const modal = document.getElementById('crudModal');
  const content = document.getElementById('crudContent');
  if (modal && content) {
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    renderStudents();
    // Animate in
    setTimeout(() => {
      content.classList.remove('scale-95', 'opacity-0');
      content.classList.add('scale-100', 'opacity-100');
    }, 10);
  }
}

function closeCrudSimulator() {
  const modal = document.getElementById('crudModal');
  const content = document.getElementById('crudContent');
  if (modal && content) {
    content.classList.remove('scale-100', 'opacity-100');
    content.classList.add('scale-95', 'opacity-0');
    setTimeout(() => {
      modal.classList.add('hidden');
      modal.classList.remove('flex');
    }, 300);
  }
}

function renderStudents(filterText = "") {
  const list = document.getElementById('studentList');
  const countSpan = document.getElementById('studentCount');
  if (!list) return;

  list.innerHTML = "";

  const filtered = students.filter(s =>
    s.name.toLowerCase().includes(filterText.toLowerCase()) ||
    s.nim.includes(filterText)
  );

  countSpan.textContent = `Total Data: ${filtered.length}`;

  if (filtered.length === 0) {
    list.innerHTML = `
      <div class="text-center py-10 text-[#94a3b8]">
        <i class="fas fa-search text-3xl mb-3 opacity-50"></i>
        <p>Data mahasiswa tidak ditemukan.</p>
      </div>
    `;
    return;
  }

  filtered.forEach(s => {
    const initial = s.name.charAt(0).toUpperCase();
    const item = document.createElement('div');
    item.className = "bg-[#0b0f14] p-4 rounded-xl border border-[#334155] flex items-center justify-between hover:border-[#38bdf8] transition-colors group";
    item.innerHTML = `
      <div class="flex items-center gap-4">
        <div class="w-10 h-10 rounded-full bg-[#38bdf8]/20 text-[#38bdf8] flex items-center justify-center font-bold text-lg border border-[#38bdf8]/30">
          ${initial}
        </div>
        <div>
          <h4 class="text-white font-medium group-hover:text-[#38bdf8] transition-colors">${s.name}</h4>
          <div class="flex flex-col sm:flex-row sm:gap-4 text-xs text-[#94a3b8] mt-0.5">
            <span class="flex items-center gap-1"><i class="fas fa-id-card"></i> ${s.nim}</span>
            <span class="flex items-center gap-1"><i class="fas fa-graduation-cap"></i> ${s.major}</span>
          </div>
        </div>
      </div>
      <div class="relative">
        <button onclick="toggleMenu(${s.id})" class="text-[#94a3b8] hover:text-white p-2 rounded-lg hover:bg-[#334155]/50 transition-colors">
          <i class="fas fa-ellipsis-v"></i>
        </button>
        <div id="menu-${s.id}" class="hidden absolute right-0 top-full mt-2 w-32 bg-[#1e293b] border border-[#334155] rounded-lg shadow-xl z-10 overflow-hidden">
          <button onclick="editStudent(${s.id})" class="w-full text-left px-4 py-2 text-sm text-[#94a3b8] hover:bg-[#334155]/50 hover:text-[#38bdf8] transition-colors border-b border-[#334155]">
            <i class="fas fa-edit mr-2"></i> Edit
          </button>
          <button onclick="deleteStudent(${s.id})" class="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-500/10 transition-colors">
            <i class="fas fa-trash-alt mr-2"></i> Hapus
          </button>
        </div>
      </div>
    `;
    list.appendChild(item);
  });
}

function filterStudents() {
  const query = document.getElementById('crudSearch').value;
  renderStudents(query);
}

function toggleMenu(id) {
  // Close all other menus
  document.querySelectorAll('[id^="menu-"]').forEach(el => {
    if (el.id !== `menu-${id}`) el.classList.add('hidden');
  });
  const menu = document.getElementById(`menu-${id}`);
  menu.classList.toggle('hidden');
}

// Close menus when clicking outside
document.addEventListener('click', function (e) {
  if (!e.target.closest('[id^="menu-"]') && !e.target.closest('button[onclick^="toggleMenu"]')) {
    document.querySelectorAll('[id^="menu-"]').forEach(el => el.classList.add('hidden'));
  }
});

// --- Form Handling ---

function openStudentForm(id = null) {
  const modal = document.getElementById('studentFormModal');
  const content = document.getElementById('studentFormContent');
  const title = document.getElementById('formTitle');
  const form = document.getElementById('studentForm');

  modal.classList.remove('hidden');
  modal.classList.add('flex');
  setTimeout(() => {
    content.classList.remove('scale-95', 'opacity-0');
    content.classList.add('scale-100', 'opacity-100');
  }, 10);

  if (id) {
    const student = students.find(s => s.id === id);
    if (student) {
      title.textContent = "Edit Mahasiswa";
      document.getElementById('studentId').value = student.id;
      document.getElementById('studentName').value = student.name;
      document.getElementById('studentNim').value = student.nim;
      document.getElementById('studentMajor').value = student.major;
    }
  } else {
    title.textContent = "Tambah Mahasiswa";
    form.reset();
    document.getElementById('studentId').value = "";
  }
}

function closeStudentForm() {
  const modal = document.getElementById('studentFormModal');
  const content = document.getElementById('studentFormContent');

  content.classList.remove('scale-100', 'opacity-100');
  content.classList.add('scale-95', 'opacity-0');
  setTimeout(() => {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
  }, 300);
}

function saveStudent(e) {
  e.preventDefault();
  const idStr = document.getElementById('studentId').value;
  const name = document.getElementById('studentName').value;
  const nim = document.getElementById('studentNim').value;
  const major = document.getElementById('studentMajor').value;

  if (idStr) {
    // Edit
    const id = parseInt(idStr);
    const index = students.findIndex(s => s.id === id);
    if (index !== -1) {
      students[index] = { id, name, nim, major };
    }
  } else {
    // Add
    const newId = students.length > 0 ? Math.max(...students.map(s => s.id)) + 1 : 1;
    students.push({ id: newId, name, nim, major });
  }

  closeStudentForm();
  renderStudents(document.getElementById('crudSearch').value);
}

function editStudent(id) {
  openStudentForm(id);
  // hide menu
  document.getElementById(`menu-${id}`).classList.add('hidden');
}

function deleteStudent(id) {
  if (confirm("Apakah Anda yakin ingin menghapus data mahasiswa ini?")) {
    students = students.filter(s => s.id !== id);
    renderStudents(document.getElementById('crudSearch').value);
  }
}

// ===== Live Demo Feature =====
const demoData = [
  { id: 1, name: "Ayam Geprek Komplit", price: "20.000", img: "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=150" },
  { id: 2, name: "Es Teh Manis Jumbo", price: "8.000", img: "https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=150" },
  { id: 3, name: "Nasi Goreng Spesial", price: "25.000", img: "https://images.unsplash.com/photo-1603133872878-684f5c9322f5?w=150" },
  { id: 4, name: "Dimsum Mentai", price: "18.000", img: "https://images.unsplash.com/photo-1496116218417-1a781b1c416c?w=150" },
  { id: 5, name: "Kopi Susu Gula Aren", price: "15.000", img: "https://images.unsplash.com/photo-1541167760496-1628856ab772?w=150" },
  { id: 6, name: "Roti Bakar Coklat", price: "12.000", img: "https://images.unsplash.com/photo-1588619461332-445105e19199?w=150" }
];

let currentDemoRef = [...demoData]; // Local state for demo manipulation

function openLiveDemo(projectId) {
  const modal = document.getElementById('liveDemoModal');
  const projectTitle = document.getElementById('demoProjectTitle');

  if (projectId === 'umkm-app') {
    projectTitle.textContent = "UMKM Management App Demo";
    renderDemoGrid(demoData);
    renderDemoList(currentDemoRef);
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
  } else if (projectData[projectId] && projectData[projectId].demo) {
    window.open(projectData[projectId].demo, '_blank');
  }
}

function closeLiveDemo() {
  const modal = document.getElementById('liveDemoModal');
  modal.classList.remove('open');
  document.body.style.overflow = '';
}

// Close on backdrop click
document.getElementById('liveDemoModal')?.addEventListener('click', (e) => {
  if (e.target.classList.contains('live-demo-modal')) closeLiveDemo();
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && document.getElementById('liveDemoModal')?.classList.contains('open')) {
    closeLiveDemo();
  }
});

// Render Functions
function renderDemoGrid(items) {
  const container = document.getElementById('demoGridContent');
  if (!container) return;

  container.innerHTML = items.map(item => `
    <div class="app-card">
      <img src="${item.img}" class="app-card-img" alt="${item.name}">
      <div class="app-card-title">${item.name}</div>
      <div class="app-card-price">Rp ${item.price}</div>
    </div>
  `).join('');
}

function renderDemoList(items) {
  const container = document.getElementById('demoListContent');
  if (!container) return;

  if (items.length === 0) {
    container.innerHTML = '<div class="text-center text-gray-400 py-10">Belum ada item</div>';
    return;
  }

  container.innerHTML = items.map(item => `
    <div class="app-list-item">
      <img src="${item.img}" class="app-list-img" alt="${item.name}">
      <div class="app-list-info">
        <div class="font-bold text-sm text-gray-800">${item.name}</div>
        <div class="text-xs text-gray-500">Rp ${item.price}</div>
      </div>
      <div class="app-list-actions">
        <button class="action-btn btn-edit"><i class="fas fa-pen"></i></button>
        <button class="action-btn btn-delete" onclick="deleteDemoItem(${item.id})"><i class="fas fa-trash"></i></button>
      </div>
    </div>
  `).join('');
}

// Logic Interactions
function filterDemoItems(query) {
  const filtered = demoData.filter(item => item.name.toLowerCase().includes(query.toLowerCase()));
  renderDemoGrid(filtered);
}

function addDemoItem() {
  const newItem = {
    id: Date.now(),
    name: "Menu Baru " + (currentDemoRef.length + 1),
    price: "10.000",
    img: "https://via.placeholder.com/150/e2e8f0/94a3b8?text=New"
  };
  currentDemoRef.push(newItem);
  renderDemoList(currentDemoRef);

  // Scroll to bottom
  const container = document.getElementById('demoListContent');
  setTimeout(() => container.scrollTop = container.scrollHeight, 10);
}

function deleteDemoItem(id) {
  if (confirm('Hapus item ini dari demo?')) {
    currentDemoRef = currentDemoRef.filter(item => item.id !== id);
    renderDemoList(currentDemoRef);
  }
}

// Mobile Tab Switching
function switchDemoScreen(index) {
  const phones = [document.getElementById('phoneGrid'), document.getElementById('phoneList')];
  const tabs = document.querySelectorAll('.control-tab');

  phones.forEach((p, i) => {
    if (i === index) p.classList.add('active');
    else p.classList.remove('active');
  });

  tabs.forEach((t, i) => {
    if (i === index) t.classList.add('active');
    else t.classList.remove('active');
  });
}

// ===== Project Health Badges Logic =====
function renderProjectBadges(lang) {
  const t = translations[lang === 'default' ? 'en' : lang] || translations['en'];

  // Find project cards based on onclick attribute
  // Selector looks for onclick="openProjectModal('...')"
  const cards = document.querySelectorAll('[onclick^="openProjectModal"]');

  cards.forEach(btn => {
    // Extract projectId from onclick string: openProjectModal('id')
    const match = btn.getAttribute('onclick').match(/'([^']+)'/);
    if (!match) return;

    const projectId = match[1];
    const status = projectStatus[projectId];

    if (!status) return;

    // Find image container to inject badge
    const cardArticle = btn.closest('.project-card');
    if (!cardArticle) return;

    const imgContainer = cardArticle.querySelector('.aspect-video');
    if (!imgContainer) return;

    // Check if badge already exists
    let badge = imgContainer.querySelector('.health-badge');

    // If not, create it
    if (!badge) {
      badge = document.createElement('span');
      // Append badge to container
      imgContainer.appendChild(badge);
    }

    // Set class and text
    badge.className = `health-badge health-badge-${status}`;
    const badgeText = t.badge && t.badge[status] ? t.badge[status] : status;
    badge.textContent = badgeText;
  });
}

// ===== Mini Data Pipeline Simulation Logic (Disabled) =====
/*
const pipelineState = {
  isRunning: false,
  nodes: ['ingest', 'transform', 'validate', 'load', 'serve'],
  currentRowCount: 0,
  currentLatency: 0,
  rejectedRows: 0,
  qualityScore: 0,
  timer: null
};
*/

// Global Safety Net
window.addEventListener("error", function (event) {
  console.error("Global pipeline error caught:", event.error);
  // Do not show to UI to keep it clean, just log
});

// ===== Pipeline Button State Machine =====
const btnConfig = {
  idle: {
    textKey: 'run',
    icon: 'fa-play',
    classAdd: ['bg-[#00ff88]', 'text-[#0b0f14]'],
    classRemove: ['bg-[#ef4444]', 'text-white', 'opacity-80', 'cursor-not-allowed'],
    disabled: false
  },
  running: {
    textKey: 'running', // Special handling for ID/EN
    icon: 'fa-spinner fa-spin',
    classAdd: ['bg-[#00ff88]', 'text-[#0b0f14]', 'opacity-80', 'cursor-not-allowed'],
    classRemove: ['bg-[#ef4444]', 'text-white'],
    disabled: true
  },
  success: {
    textKey: 'run',
    icon: 'fa-play',
    classAdd: ['bg-[#00ff88]', 'text-[#0b0f14]'],
    classRemove: ['bg-[#ef4444]', 'text-white', 'opacity-80', 'cursor-not-allowed'],
    disabled: false
  },
  failed: {
    textKey: 'retry',
    icon: 'fa-redo',
    classAdd: ['bg-[#ef4444]', 'text-white'],
    classRemove: ['bg-[#00ff88]', 'text-[#0b0f14]', 'opacity-80', 'cursor-not-allowed'],
    disabled: false
  }
};

function updateRunButton(status) {
  const btn = document.getElementById('btnRunPipeline');
  if (!btn) return;
  // ... rest of the logic can stay as it won't be called without the button
}

async function runPipeline() {
  const btn = document.getElementById('btnRunPipeline');
  if (!btn) return;
  
  if (typeof pipelineState === 'undefined' || pipelineState.isRunning) return;

  try {
    await internalRunPipeline(btn);
  } catch (err) {
    handleSystemError(err);
    // Force fail state on clean error
    endPipeline(false, localStorage.getItem('siteLang') || 'en', err.step || 'System');
  }
}

async function internalRunPipeline(btn) {
  const simulateFail = document.getElementById('simulateFailure')?.checked || false;
  const lang = localStorage.getItem('siteLang') || 'en';
  const t = (typeof translations !== 'undefined' && translations[lang === 'default' ? 'en' : lang])
    ? translations[lang === 'default' ? 'en' : lang]
    : (typeof translations !== 'undefined' ? translations['en'] : null);

  if (!t) throw new Error("Translations missing");

  // 1. Set State & UI -> RUNNING
  pipelineState.isRunning = true;
  updateRunButton('running');

  // Reset logs & metrics visual only (state reset happens in resetPipeline, but we want to keep current invocation context)
  resetPipeline(true);

  addLog(t.pipeline?.logs?.start || "Starting...", 'info');

  const rawRows = Math.floor(Math.random() * 45000) + 5000;
  const rejected = Math.floor(rawRows * (Math.random() * 0.05));
  const cleanRows = rawRows - rejected;

  pipelineState.rejectedRows = 0;

  // --- Step 1: Ingest ---
  const ingestMsg = t.pipeline?.logs?.ingest;
  const ingestSuccess = safeReplace(t.pipeline?.logs?.ingestSuccess, '{val}', rawRows.toLocaleString());

  if (!await executeStep('ingest', 800, ingestMsg, ingestSuccess)) {
    throw new Error("Pipeline stopped at Ingest"); // Should not happen in this logic normally
  }

  pipelineState.currentRowCount = rawRows;
  updateMetrics(pipelineState.currentRowCount, pipelineState.currentLatency, 0, '-');

  // --- Step 2: Transform ---
  const transformMsg = t.pipeline?.logs?.transform;
  const transformWarn = safeReplace(t.pipeline?.logs?.transformWarn, '{val}', rejected.toLocaleString());
  const transformSuccess = safeReplace(t.pipeline?.logs?.transformSuccess, '{val}', cleanRows.toLocaleString());

  setTimeout(() => addLog(transformWarn, 'warn'), 600);

  if (!await executeStep('transform', 1500, transformMsg, transformSuccess)) {
    throw new Error("Pipeline stopped at Transform");
  }

  pipelineState.currentRowCount = cleanRows;
  pipelineState.rejectedRows = rejected;
  updateMetrics(cleanRows, pipelineState.currentLatency, rejected, '-');

  // --- Step 3: Validate ---
  const validateMsg = t.pipeline?.logs?.validate;

  // DETERMINISTIC FAILURE
  if (simulateFail) {
    setTimeout(() => addLog("TEST: not_null(user_id) FAILED (null_rate=100%)", 'error'), 800);
    const validateFailMsg = t.pipeline?.logs?.validateFail || "Validation Failed";

    // Execute step but force fail
    await executeStep('validate', 1200, validateMsg, null, true, validateFailMsg);

    // Throw Domain Error
    const error = new Error(validateFailMsg);
    error.isDomainError = true;
    error.step = 'Validate';
    throw error;
  }

  // Normal Flow
  setTimeout(() => addLog(t.pipeline?.logs?.validateTest1, 'test'), 400);
  setTimeout(() => addLog(t.pipeline?.logs?.validateTest2, 'test'), 700);

  const qualityScore = Math.floor(Math.random() * (100 - 92 + 1) + 92);
  const validateSuccess = safeReplace(t.pipeline?.logs?.validateSuccess, '{val}', qualityScore + '%');

  if (!await executeStep('validate', 1500, validateMsg, validateSuccess)) {
    const error = new Error("Validation Failed Unknown");
    error.isDomainError = true;
    error.step = 'Validate';
    throw error;
  }

  pipelineState.qualityScore = qualityScore;
  updateMetrics(cleanRows, pipelineState.currentLatency, rejected, qualityScore + '%');

  // --- Step 4: Load ---
  const loadMsg = t.pipeline?.logs?.load;
  const loadSuccess = safeReplace(t.pipeline?.logs?.loadSuccess, '{val}', cleanRows.toLocaleString());

  if (!await executeStep('load', 1500, loadMsg, loadSuccess)) {
    // Could simulate load failure here if desired, but we focus on validate for now
    const error = new Error("Load Failed");
    error.isDomainError = true;
    error.step = 'Load';
    throw error;
  }

  // --- Step 5: Serve ---
  const serveMsg = t.pipeline?.logs?.serve;
  const serveSuccess = safeReplace(t.pipeline?.logs?.serveSuccess, '{val}', pipelineState.currentLatency);

  if (!await executeStep('serve', 800, serveMsg, serveSuccess)) {
    const error = new Error("Serve Failed");
    error.isDomainError = true;
    error.step = 'Serve';
    throw error;
  }

  addLog(t.pipeline?.logs?.done, 'success');
  // SUCCESS END
  endPipeline(true, lang, null);
}

function handleSystemError(err) {
  if (err.isDomainError) {
    // Controlled failure (Simulated)
    // Log is already handled in executeStep(forceFail=true) usually,
    // but if thrown manually, ensure it's logged.
    // In our logic, executeStep handles the UI update for failed node.
    // The endPipeline call in runPipeline's catch block will handle the final UI state.
    console.warn("Domain Error:", err.message, "at step:", err.step);
  } else {
    // Unexpected Bug
    console.error("System Error:", err);
    addLog("ERROR: Check console.", 'error'); // Keep UI clean
  }
}

// Helper for safe string replacement
function safeReplace(str, search, replacement) {
  if (typeof str !== 'string') return "";
  return str.replace(search, replacement);
}

async function executeStep(nodeId, duration, startMsg, successMsg, forceFail = false, failMsg = "") {
  const node = document.getElementById(`node-${nodeId}`);
  if (!node) return true;

  node.classList.add('active');
  if (startMsg) addLog(startMsg, 'info');

  const startTime = Date.now();

  return new Promise(resolve => {
    setTimeout(() => {
      const elapsed = Date.now() - startTime;
      pipelineState.currentLatency += elapsed;
      updateMetrics(pipelineState.currentRowCount, pipelineState.currentLatency, pipelineState.rejectedRows, pipelineState.qualityScore || '-');

      node.classList.remove('active');

      if (forceFail) {
        node.classList.add('failed');
        if (failMsg) addLog(failMsg, 'error');
        resolve(false);
      } else {
        node.classList.add('success');
        if (successMsg) addLog(successMsg, 'success');
        resolve(true);
      }
    }, duration);
  });
}

function endPipeline(success, lang, failedStep) {
  pipelineState.isRunning = false;

  // Update Button UI based on Result
  updateRunButton(success ? 'success' : 'failed');

  // Show Summary
  const t = translations[lang === 'default' ? 'en' : lang] || translations['en'];
  showRunSummary(success, t, lang, failedStep);
}

function showRunSummary(success, t, lang, failedStep) {
  const summary = document.getElementById('pipeline-summary');
  if (!summary) return;

  summary.classList.remove('hidden');

  const reasonText = safeReplace(t?.pipeline?.summary?.reason, '{step}', failedStep || 'Unknown');
  const statText = safeReplace(safeReplace(t?.pipeline?.summary?.stat, '{rows}', pipelineState.currentRowCount.toLocaleString()), '{latency}', pipelineState.currentLatency);

  summary.innerHTML = `
        <div class="flex items-center gap-3 mb-2">
            <div class="w-8 h-8 rounded-full ${success ? 'bg-[#00ff88]/20 text-[#00ff88]' : 'bg-[#ef4444]/20 text-[#ef4444]'} flex items-center justify-center">
                <i class="fas ${success ? 'fa-check' : 'fa-times'}"></i>
            </div>
            <div>
                <h4 class="text-sm font-bold text-white">${success ? t?.pipeline?.summary?.success : t?.pipeline?.summary?.failed}</h4>
                <p class="text-xs text-[#94a3b8]">${success ? statText : reasonText}</p>
            </div>
        </div>
    `;
}

function resetPipeline(internalRequest = false) {
  // If external click, check if running
  if (!internalRequest && pipelineState.isRunning) {
    console.warn("Cannot reset while running");
    return;
  }

  // 1. Reset State
  pipelineState.currentRowCount = 0;
  pipelineState.currentLatency = 0;
  pipelineState.rejectedRows = 0;
  pipelineState.qualityScore = 0;

  // 2. Reset Visuals
  document.querySelectorAll('.pipeline-node').forEach(n => {
    n.classList.remove('active', 'success', 'failed');
    const iconBox = n.querySelector('.w-16');
    if (iconBox) iconBox.style.borderColor = '';
  });

  document.getElementById('pipeline-logs').innerHTML = '<div class="opacity-50 text-center py-8">Waiting to start...</div>';
  updateMetrics(0, 0, 0, '-');

  const summary = document.getElementById('pipeline-summary');
  if (summary) summary.classList.add('hidden');

  // 3. Reset Button (Only if external click or Init)
  if (!internalRequest) {
    updateRunButton('idle');
  }
}

function addLog(msg, type = 'info') {
  if (!msg) return; // Guard empty messages
  const logPanel = document.getElementById('pipeline-logs');
  if (!logPanel) return;

  if (logPanel.children[0]?.classList.contains('text-center')) {
    logPanel.innerHTML = '';
  }

  const now = new Date().toLocaleTimeString('en-US', { hour12: false });
  const div = document.createElement('div');

  // Map types to classes
  let colorClass = 'text-[#94a3b8]'; // Default info
  if (type === 'success') colorClass = 'text-[#00ff88]';
  if (type === 'error') colorClass = 'text-[#ef4444]';
  if (type === 'warn') colorClass = 'text-[#f59e0b]';
  if (type === 'test') colorClass = 'text-[#38bdf8]';

  div.className = `log-entry mb-1 ${colorClass} text-[10px] sm:text-xs font-mono`;
  div.innerHTML = `<span class="opacity-40 mr-2">[${now}]</span><span class="${type === 'test' || type === 'warn' ? 'font-semibold' : ''}">${msg}</span>`;

  logPanel.appendChild(div);
  logPanel.scrollTop = logPanel.scrollHeight;
}

function updateMetrics(rows, latency, rejected = 0, quality = '-') {
  const rowEl = document.getElementById('metric-rows');
  if (rowEl) rowEl.textContent = rows.toLocaleString();

  const latEl = document.getElementById('metric-latency');
  if (latEl) latEl.textContent = latency + 'ms';

  const rejEl = document.getElementById('metric-rejected');
  if (rejEl) rejEl.textContent = rejected.toLocaleString();

  const qualEl = document.getElementById('metric-quality');
  if (qualEl) qualEl.textContent = quality;
}

// ===== Initialization =====
document.addEventListener('DOMContentLoaded', () => {
  // Pipeline Simulation Controls
  const btnRun = document.getElementById('btnRunPipeline');
  if (btnRun) {
    // Avoid duplicates if any
    btnRun.onclick = null;
    btnRun.addEventListener('click', (e) => {
      e.preventDefault();
      runPipeline();
    });
  }

  // 2. Attach Reset Listener
  const btnReset = document.getElementById('btnResetPipeline');
  if (btnReset) {
    btnReset.onclick = null;
    btnReset.addEventListener('click', (e) => {
      e.preventDefault();
      resetPipeline(); // external call
    });
  }

  // 3. Force Initial State (Idle)
  resetPipeline(false);
});

// Expose to Global Window
window.runPipeline = runPipeline;
window.resetPipeline = resetPipeline;
window.pipelineState = pipelineState;
