export type Locale = "en" | "zh" | "es";

export const LOCALES: { code: Locale; label: string }[] = [
  { code: "en", label: "English" },
  { code: "zh", label: "中文" },
  { code: "es", label: "Español" },
];

export type LceaCategoryKey = "dysplastic" | "borderline" | "normal" | "increasedCoverage";

export interface Messages {
  appTitle: string;
  appSubtitle: string;
  languageLabel: string;
  backHome: string;
  howCalculated: string;
  measureXray: string;
  uploadXray: string;
  loadCase: string;
  saveCase: string;
  exportPdf: string;
  uploadAria: string;
  loadAria: string;
  placeholderTitle: string;
  placeholderHint: string;
  leftLcea: string;
  rightLcea: string;
  status: string;
  xrayAlt: string;
  errorChooseImage: string;
  errorReadFile: string;
  errorLoadCase: string;
  errorNoImage: string;
  errorViewerSize: string;
  errorPdfImage: string;
  pdfLeft: string;
  pdfRight: string;
  pdfLeftLcea: string;
  pdfRightLcea: string;
  categories: Record<LceaCategoryKey, string>;
  info: {
    title: string;
    femoralHeadTitle: string;
    femoralHeadBody: string;
    acetabulumTitle: string;
    acetabulumBody: string;
    angleTitle: string;
    angleIntro: string;
    angleVertical: string;
    angleSecond: string;
    angleResult: string;
    rangesTitle: string;
    rangesIntro: string;
    rangeDysplastic: string;
    rangeBorderline: string;
    rangeNormal: string;
    rangeIncreased: string;
    disclaimer: string;
    guideImageAlt: string;
    guideStep1: string;
    guideStep2: string;
  };
}

const en: Messages = {
  appTitle: "LCEA Calculator",
  appSubtitle: "Lateral Center Edge Angle from hip X-ray",
  languageLabel: "Language",
  backHome: "← Back to home",
  howCalculated: "How the angle is calculated",
  measureXray: "Measure an X-ray",
  uploadXray: "Upload X-ray",
  loadCase: "Load case",
  saveCase: "Save case",
  exportPdf: "Export PDF",
  uploadAria: "Upload X-ray image",
  loadAria: "Load saved case",
  placeholderTitle: "Upload an X-ray image (JPEG or PNG) to start.",
  placeholderHint:
    "Place two circles on left and right femoral heads (drag edge to resize). Place the purple dot on the left lateral acetabulum and the green dot on the right.",
  leftLcea: "Left LCEA",
  rightLcea: "Right LCEA",
  status: "Status",
  xrayAlt: "X-ray",
  errorChooseImage: "Please choose an image file (JPEG or PNG).",
  errorReadFile: "Failed to read file.",
  errorLoadCase: "Failed to load case.",
  errorNoImage: "No image loaded.",
  errorViewerSize: "Viewer size unknown. Try resizing the window and export again.",
  errorPdfImage: "Failed to prepare image for PDF.",
  pdfLeft: "Left",
  pdfRight: "Right",
  pdfLeftLcea: "Left LCEA",
  pdfRightLcea: "Right LCEA",
  categories: {
    dysplastic: "Dysplastic",
    borderline: "Borderline",
    normal: "Normal",
    increasedCoverage: "Increased coverage",
  },
  info: {
    title: "How the LCEA is calculated",
    femoralHeadTitle: "What is the femoral head?",
    femoralHeadBody:
      "The femoral head is the rounded, ball-like top of the thigh bone (femur) that sits inside the hip socket. On an anteroposterior (AP) pelvic or hip X-ray, you see it as a circle on each side. In this app, you fit a circle to each femoral head so we can find its center.",
    acetabulumTitle: "What is the lateral acetabulum?",
    acetabulumBody:
      "The acetabulum is the cup-shaped socket of the hip bone that holds the femoral head. The lateral edge of the acetabulum is the outer, superior rim of that socket—often referred to as the “sourcil” or roof of the acetabulum on X-ray. You place a dot on this lateral edge for each hip so we can measure the angle.",
    angleTitle: "How is the angle calculated?",
    angleIntro: "The Lateral Center Edge Angle (LCEA) is measured on an AP pelvic/hip X-ray. For each hip:",
    angleVertical:
      "A vertical line is drawn straight down through the center of the femoral head.",
    angleSecond:
      "A second line is drawn from the center of the femoral head to the lateral edge of the acetabulum (your dot).",
    angleResult:
      "The LCEA is the angle between these two lines. It reflects how much the socket covers the top and side of the femoral head.",
    rangesTitle: "What do the angle ranges mean?",
    rangesIntro: "Interpretation is typically based on the measured angle (in degrees):",
    rangeDysplastic:
      "< 20° — Often considered dysplastic; the socket may provide insufficient coverage (hip dysplasia).",
    rangeBorderline:
      "20°–25° — Borderline; may warrant follow-up or context from other findings.",
    rangeNormal: "25°–39° — Generally normal coverage for adults.",
    rangeIncreased:
      "≥ 40° — Increased coverage; can be associated with pincer-type morphology or overcoverage.",
    disclaimer:
      "These ranges are guidelines. Interpretation should be done by a qualified clinician in the context of the full image and clinical picture.",
    guideImageAlt: "Pelvic X-ray with yellow circles on the femoral heads and red circles on the lateral acetabulum",
    guideStep1: "1. Drag the circle to fit the femoral head",
    guideStep2:
      "2. Drag the circle onto the lateral acetabulum and the calculator will automatically show you the angle at the bottom of the screen",
  },
};

const zh: Messages = {
  appTitle: "LCEA 计算器",
  appSubtitle: "髋关节 X 线侧方中心边缘角",
  languageLabel: "语言",
  backHome: "← 返回首页",
  howCalculated: "角度如何计算",
  measureXray: "测量 X 线片",
  uploadXray: "上传 X 线片",
  loadCase: "加载病例",
  saveCase: "保存病例",
  exportPdf: "导出 PDF",
  uploadAria: "上传 X 线片图像",
  loadAria: "加载已保存的病例",
  placeholderTitle: "请上传 X 线片图像（JPEG 或 PNG）开始。",
  placeholderHint:
    "在左右股骨头上放置两个圆（拖动边缘可调整大小）。将紫色点放在左侧髋臼外侧缘，将绿色点放在右侧。",
  leftLcea: "左侧 LCEA",
  rightLcea: "右侧 LCEA",
  status: "状态",
  xrayAlt: "X 线片",
  errorChooseImage: "请选择图像文件（JPEG 或 PNG）。",
  errorReadFile: "读取文件失败。",
  errorLoadCase: "加载病例失败。",
  errorNoImage: "尚未加载图像。",
  errorViewerSize: "无法获取查看器尺寸。请调整窗口大小后重试导出。",
  errorPdfImage: "准备 PDF 图像失败。",
  pdfLeft: "左侧",
  pdfRight: "右侧",
  pdfLeftLcea: "左侧 LCEA",
  pdfRightLcea: "右侧 LCEA",
  categories: {
    dysplastic: "发育不良",
    borderline: "临界",
    normal: "正常",
    increasedCoverage: "覆盖增加",
  },
  info: {
    title: "LCEA 如何计算",
    femoralHeadTitle: "什么是股骨头？",
    femoralHeadBody:
      "股骨头是大腿骨（股骨）顶部呈球形的部分，位于髋臼窝内。在骨盆或髋关节前后位（AP）X 线片上，两侧各可见一个近似圆形的结构。在本应用中，您为每个股骨头拟合一个圆，以便确定其中心。",
    acetabulumTitle: "什么是髋臼外侧缘？",
    acetabulumBody:
      "髋臼是髋骨上容纳股骨头的杯状窝。髋臼外侧缘是该窝的外上缘，X 线片上常称为“sourcil”（髋臼顶）。请在每侧髋臼外侧缘放置一个点，以便测量角度。",
    angleTitle: "角度如何计算？",
    angleIntro: "侧方中心边缘角（LCEA）在骨盆/髋关节 AP X 线片上测量。对每一侧髋关节：",
    angleVertical: "通过股骨头中心画一条竖直向下的垂线。",
    angleSecond: "从股骨头中心到髋臼外侧缘（您放置的点）再画第二条线。",
    angleResult: "LCEA 是这两条线之间的夹角，反映髋臼对股骨头顶部和外侧的覆盖程度。",
    rangesTitle: "角度范围代表什么？",
    rangesIntro: "通常根据测得的角度（度）进行解读：",
    rangeDysplastic: "< 20° — 通常视为发育不良；髋臼覆盖可能不足（髋关节发育不良）。",
    rangeBorderline: "20°–25° — 临界；可能需要随访或结合其他检查结果。",
    rangeNormal: "25°–39° — 成人一般属正常覆盖。",
    rangeIncreased: "≥ 40° — 覆盖增加；可能与钳夹型形态或过度覆盖有关。",
    disclaimer: "以上范围为参考指南。解读应由具备资质的临床医生结合完整影像和临床表现进行。",
    guideImageAlt: "骨盆 X 线片：黄色圆圈标出股骨头，红色圆圈标出髋臼外侧缘",
    guideStep1: "1. 拖动圆圈以贴合股骨头",
    guideStep2: "2. 将圆圈拖到髋臼外侧缘，计算器会在屏幕底部自动显示角度",
  },
};

const es: Messages = {
  appTitle: "Calculadora LCEA",
  appSubtitle: "Ángulo centro-borde lateral desde radiografía de cadera",
  languageLabel: "Idioma",
  backHome: "← Volver al inicio",
  howCalculated: "Cómo se calcula el ángulo",
  measureXray: "Medir una radiografía",
  uploadXray: "Subir radiografía",
  loadCase: "Cargar caso",
  saveCase: "Guardar caso",
  exportPdf: "Exportar PDF",
  uploadAria: "Subir imagen de radiografía",
  loadAria: "Cargar caso guardado",
  placeholderTitle: "Suba una imagen de radiografía (JPEG o PNG) para comenzar.",
  placeholderHint:
    "Coloque dos círculos en las cabezas femorales izquierda y derecha (arrastre el borde para cambiar el tamaño). Coloque el punto púrpura en el borde lateral del acetábulo izquierdo y el verde en el derecho.",
  leftLcea: "LCEA izquierda",
  rightLcea: "LCEA derecha",
  status: "Estado",
  xrayAlt: "Radiografía",
  errorChooseImage: "Elija un archivo de imagen (JPEG o PNG).",
  errorReadFile: "No se pudo leer el archivo.",
  errorLoadCase: "No se pudo cargar el caso.",
  errorNoImage: "No hay imagen cargada.",
  errorViewerSize: "Tamaño del visor desconocido. Redimensione la ventana e intente exportar de nuevo.",
  errorPdfImage: "No se pudo preparar la imagen para el PDF.",
  pdfLeft: "Izquierda",
  pdfRight: "Derecha",
  pdfLeftLcea: "LCEA izquierda",
  pdfRightLcea: "LCEA derecha",
  categories: {
    dysplastic: "Displásica",
    borderline: "Límite",
    normal: "Normal",
    increasedCoverage: "Cobertura aumentada",
  },
  info: {
    title: "Cómo se calcula el LCEA",
    femoralHeadTitle: "¿Qué es la cabeza femoral?",
    femoralHeadBody:
      "La cabeza femoral es la parte redondeada y esférica del extremo superior del fémur que se articula en la cavidad de la cadera. En una radiografía anteroposterior (AP) de pelvis o cadera se ve como un círculo a cada lado. En esta aplicación, usted ajusta un círculo a cada cabeza femoral para hallar su centro.",
    acetabulumTitle: "¿Qué es el borde lateral del acetábulo?",
    acetabulumBody:
      "El acetábulo es la cavidad en forma de copa del hueso de la cadera que contiene la cabeza femoral. El borde lateral del acetábulo es el reborde superior externo de esa cavidad—a menudo llamado “sourcil” o techo acetabular en la radiografía. Coloque un punto en ese borde en cada cadera para medir el ángulo.",
    angleTitle: "¿Cómo se calcula el ángulo?",
    angleIntro:
      "El ángulo centro-borde lateral (LCEA) se mide en una radiografía AP de pelvis/cadera. Para cada cadera:",
    angleVertical:
      "Se traza una línea vertical hacia abajo a través del centro de la cabeza femoral.",
    angleSecond:
      "Se traza una segunda línea desde el centro de la cabeza femoral hasta el borde lateral del acetábulo (su punto).",
    angleResult:
      "El LCEA es el ángulo entre estas dos líneas. Refleja cuánto cubre la cavidad la parte superior y lateral de la cabeza femoral.",
    rangesTitle: "¿Qué significan los rangos del ángulo?",
    rangesIntro: "La interpretación suele basarse en el ángulo medido (en grados):",
    rangeDysplastic:
      "< 20° — Suele considerarse displásica; la cavidad puede ofrecer cobertura insuficiente (displasia de cadera).",
    rangeBorderline:
      "20°–25° — Límite; puede requerir seguimiento o contexto de otros hallazgos.",
    rangeNormal: "25°–39° — Cobertura generalmente normal en adultos.",
    rangeIncreased:
      "≥ 40° — Cobertura aumentada; puede asociarse a morfología tipo pinza o sobrecobertura.",
    disclaimer:
      "Estos rangos son orientativos. La interpretación debe realizarla un clínico cualificado en el contexto de la imagen completa y el cuadro clínico.",
    guideImageAlt: "Radiografía pélvica con círculos amarillos en las cabezas femorales y círculos rojos en el acetábulo lateral",
    guideStep1: "1. Arrastre el círculo para ajustarlo a la cabeza femoral",
    guideStep2:
      "2. Arrastre el círculo hasta el borde lateral del acetábulo y la calculadora mostrará automáticamente el ángulo en la parte inferior de la pantalla",
  },
};

export const translations: Record<Locale, Messages> = { en, zh, es };
