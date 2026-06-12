// ============================================================
// Pages by SoftFocus Labs — Constants, state & component schema
// ============================================================
'use strict';

  // ===== CONSTANTS =====
  const STORAGE_KEY = 'masterpager_projects';
  const ACTIVE_KEY = 'masterpager_active';

  // ===== STATE =====
  const state = {
    components: [],
    selectedId: null,
    activeTab: 'visual',
    codeTab: 'html',
    history: [],
    historyIndex: -1,
    iconPickerCallback: null,
    activeProjectId: null,
    canvasBg: '',
    pageAlignment: 'center',
    pageTitle: '',
    googleAnalyticsId: '',
    favicon: '',         // data URL (uploaded) or external URL
    faviconType: '',     // 'data' or 'url'
  };

  // ===== COMPONENT DEFINITIONS =====
  const COMPONENT_DEFS = {
    section: {
      label: 'Section',
      container: true,
      defaultStyles: { padding: '40px 24px', backgroundColor: '' },
    },
    row: {
      label: 'Row',
      container: true,
      defaultStyles: { padding: '16px' },
    },
    'columns-2': {
      label: '2 Columns',
      container: true,
      columns: 2,
      defaultStyles: { display: 'flex', gap: '16px', padding: '16px' },
    },
    'columns-3': {
      label: '3 Columns',
      container: true,
      columns: 3,
      defaultStyles: { display: 'flex', gap: '16px', padding: '16px' },
    },
    'columns-4': {
      label: '4 Columns',
      container: true,
      columns: 4,
      defaultStyles: { display: 'flex', gap: '16px', padding: '16px' },
    },
    column: {
      label: 'Column',
      container: true,
      defaultStyles: { flex: '1', minHeight: '60px' },
    },
    heading: {
      label: 'Heading',
      editable: true,
      defaultContent: 'Your Heading Here',
      defaultStyles: { fontSize: '28px', fontWeight: '700', color: '#1a1a2e', padding: '8px 16px' },
    },
    text: {
      label: 'Text',
      editable: true,
      defaultContent: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
      defaultStyles: { fontSize: '16px', color: '#4a4a6a', lineHeight: '1.6', padding: '8px 16px' },
    },
    image: {
      label: 'Image',
      defaultProps: { src: '', alt: 'Image', imageFit: 'contain' },
      defaultStyles: { padding: '8px 16px' },
    },
    button: {
      label: 'Button',
      defaultProps: { text: 'Click Me', href: '#' },
      defaultStyles: {
        padding: '8px 16px',
        buttonBg: '#027ac4',
        buttonColor: '#ffffff',
        buttonPadding: '12px 28px',
        buttonRadius: '6px',
        fontSize: '15px',
        fontWeight: '600',
      },
    },
    icon: {
      label: 'Icon',
      defaultProps: { iconName: 'star' },
      defaultStyles: {
        padding: '8px 16px',
        textAlign: 'center',
        iconSize: '40px',
        color: '#027ac4',
      },
    },
    svg: {
      label: 'Vector',
      defaultProps: { svgCode: '' },
      defaultStyles: { padding: '8px 16px', textAlign: 'center' },
    },
    embed: {
      label: 'Embed',
      defaultProps: { embedCode: '' },
      defaultStyles: { padding: '8px 16px' },
    },
    divider: {
      label: 'Divider',
      defaultStyles: { padding: '8px 16px', borderColor: '#e0e0f0', borderWidth: '2px' },
    },
    spacer: {
      label: 'Spacer',
      defaultStyles: { height: '40px' },
    },
    calendly: {
      label: 'Calendly',
      defaultProps: { calendlyUrl: '' },
      defaultStyles: { padding: '8px 16px' },
    },
  };

  const FONT_OPTIONS = [
    'Inter', 'Arial', 'Georgia', 'Times New Roman', 'Courier New',
    'Roboto', 'Open Sans', 'Lato', 'Montserrat', 'Playfair Display',
    'Poppins', 'Raleway', 'Oswald', 'Merriweather', 'PT Sans', 'PT Serif',
    'Nunito', 'Nunito Sans', 'Ubuntu', 'Rubik', 'Work Sans', 'Fira Sans',
    'Barlow', 'Quicksand', 'Mulish', 'Karla', 'Libre Baskerville',
    'Crimson Text', 'Josefin Sans', 'Cabin', 'Archivo', 'DM Sans',
    'DM Serif Display', 'Space Grotesk', 'Sora', 'Outfit',
    'Plus Jakarta Sans', 'Manrope', 'Bitter', 'Cormorant Garamond',
  ];

  const LUCIDE_ICONS = [
    'activity','airplay','alert-circle','alert-triangle','anchor','archive',
    'arrow-down','arrow-left','arrow-right','arrow-up','at-sign','award',
    'bar-chart-2','battery','bell','bluetooth','bold','book','bookmark',
    'box','briefcase','calendar','camera','check','check-circle','chevron-down',
    'chevron-left','chevron-right','chevron-up','circle','clipboard','clock',
    'cloud','code','coffee','command','compass','copy','cpu','credit-card',
    'crop','crosshair','database','dollar-sign','download','droplet',
    'edit','external-link','eye','facebook','fast-forward','feather',
    'file','film','filter','flag','folder','gift','github','globe',
    'grid-3x3','hash','headphones','heart','help-circle','home','image','inbox',
    'info','key','layers','layout','life-buoy','link','list',
    'lock','log-in','log-out','mail','map','map-pin','maximize','menu',
    'message-circle','message-square','mic','minimize','minus','monitor','moon',
    'more-horizontal','more-vertical','mouse-pointer','move','music',
    'octagon','package','paperclip','pause','pen-tool','percent','phone',
    'pie-chart','play','plus','pocket','power','printer','radio','refresh-cw',
    'repeat','rewind','rotate-cw','rss','save','scissors','search','send',
    'server','settings','share-2','shield','shopping-bag','shopping-cart','shuffle',
    'sidebar','skip-back','skip-forward','slash','sliders','smartphone',
    'smile','speaker','square','star','stop-circle','sun','sunrise','sunset',
    'tablet','tag','target','terminal','thermometer','thumbs-down','thumbs-up',
    'toggle-left','toggle-right','trash-2','trending-down','trending-up','triangle',
    'truck','tv','type','umbrella','underline','unlock','upload',
    'user','users','video','voicemail','volume-2','watch','wifi','wind',
    'x','zap','zoom-in','zoom-out','rocket','flame','sparkles','wand-2',
    'palette','brush','pen','newspaper','megaphone','crown','gem','trophy',
    'graduation-cap','building-2','store','car','plane','bike',
    'trees','mountain','waves',
  ];
