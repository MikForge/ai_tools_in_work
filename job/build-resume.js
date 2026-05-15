const fs = require("fs");
const {
  Document, Packer, Paragraph, TextRun,
  AlignmentType, HeadingLevel, BorderStyle,
  LevelFormat, TabStopType, TabStopPosition,
  ShadingType, WidthType, Table, TableRow, TableCell,
} = require("docx");

const FONT = "Microsoft YaHei";
const FONT_SIZE = 21; // 10.5pt
const HEADING_COLOR = "1F4E79";
const SUBHEADING_COLOR = "2E75B6";
const MUTED = "666666";
const ACCENT = "1F4E79";

// ── helpers ──────────────────────────────────────────────

const txt = (text, opts = {}) =>
  new TextRun({ text, font: FONT, size: FONT_SIZE, ...opts });

const bold = (text, opts = {}) => txt(text, { bold: true, ...opts });

const muted = (text) => txt(text, { color: MUTED, size: 18 });

const bullet = (text, opts = {}) =>
  new Paragraph({
    numbering: { reference: "bullets", level: 0 },
    spacing: { after: 40 },
    children: [txt(text, opts)],
  });

const multiBullet = (parts) =>
  new Paragraph({
    numbering: { reference: "bullets", level: 0 },
    spacing: { after: 40 },
    children: parts,
  });

const emptyLine = () => new Paragraph({ spacing: { after: 60 }, children: [] });

const divider = () =>
  new Paragraph({
    spacing: { before: 120, after: 120 },
    border: {
      bottom: { style: BorderStyle.SINGLE, size: 6, color: "D0D0D0", space: 1 },
    },
    children: [],
  });

const sectionHeading = (text) =>
  new Paragraph({
    heading: HeadingLevel.HEADING_1,
    children: [new TextRun({ text, font: FONT, size: 28, bold: true, color: HEADING_COLOR })],
  });

const subHeading = (text) =>
  new Paragraph({
    heading: HeadingLevel.HEADING_2,
    children: [new TextRun({ text, font: FONT, size: 24, bold: true, color: SUBHEADING_COLOR })],
  });

const rightAligned = (text) =>
  new Paragraph({
    alignment: AlignmentType.RIGHT,
    spacing: { after: 60 },
    children: [muted(text)],
  });

// ── document ─────────────────────────────────────────────

const doc = new Document({
  styles: {
    default: { document: { run: { font: FONT, size: FONT_SIZE } } },
    paragraphStyles: [
      {
        id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 28, bold: true, font: FONT, color: HEADING_COLOR },
        paragraph: { spacing: { before: 300, after: 160 }, outlineLevel: 0 },
      },
      {
        id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 24, bold: true, font: FONT, color: SUBHEADING_COLOR },
        paragraph: { spacing: { before: 240, after: 120 }, outlineLevel: 1 },
      },
    ],
  },
  numbering: {
    config: [
      {
        reference: "bullets",
        levels: [{
          level: 0, format: LevelFormat.BULLET, text: "•", alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 720, hanging: 360 } } },
        }],
      },
    ],
  },
  sections: [
    {
      properties: {
        page: {
          size: { width: 11906, height: 16838 }, // A4
          margin: { top: 1200, right: 1100, bottom: 1000, left: 1100 },
        },
      },
      children: [
        // ═══ HEADER ═══
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 60 },
          children: [new TextRun({ text: "个人简历", font: FONT, size: 42, bold: true, color: ACCENT })],
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 80 },
          children: [
            new TextRun({ text: "复合型客户端开发工程师", font: FONT, size: 24, color: MUTED }),
          ],
        }),
        divider(),

        // ═══ 个人定位 ═══
        sectionHeading("个人定位"),
        new Paragraph({
          spacing: { after: 120 },
          children: [
            txt("复合型客户端开发工程师，6 年游戏客户端经验（Cocos Creator / Egret + TypeScript），同时具备量化交易系统、后端架构与 Python 数据处理的完整工程落地能力。擅长从 0 到 1 搭建系统，强调结构、流程与边界控制。"),
          ],
        }),

        // ═══ 专业技能 ═══
        sectionHeading("专业技能"),
        ...skillBlocks(),

        // ═══ 工作经历 ═══
        sectionHeading("工作经历"),
        workEntry(
          "广州A公司  |  客户端开发  |  2020.09 - 2025.08",
          [
            "负责公司 H5 休闲游戏项目的核心玩法与系统模块开发（家园、寻物、物品归类等）。",
            "使用 TypeScript + Cocos Creator / Egret 实现玩法逻辑、UI 界面与活动系统，保证多端运行的稳定性与流畅度。",
            "编写并维护通用工具类、基础类库与 UI 组件，减少重复代码，提高整体开发效率与代码一致性。",
            "参与多语言 / 本地化与海外版本的适配工作，处理不同渠道、不同机型下的兼容性与表现问题。",
            "与策划、美术、服务器开发紧密协作，推进版本按期上线，并持续跟进线上问题与版本优化。",
          ],
        ),
        workEntry(
          "广州B公司  |  客户端开发  |  2018.06 - 2020.06",
          [
            "基于 Egret 引擎开发 H5 小游戏及相关界面系统，负责 UI 构建、交互逻辑实现与基础组件封装。",
            "在项目中采用 MVC 架构组织界面与业务逻辑，提升代码结构清晰度和后续扩展性。",
            "与服务端工程师协作，对接通信协议，完成数据解析、错误处理等逻辑，保证前后端交互的稳定与正确。",
            "负责接入并调试各平台 SDK（登录、支付、统计等），支持多渠道版本上线与后续运营。",
          ],
        ),

        // ═══ 项目经验 ═══
        sectionHeading("项目经验"),
        subHeading("游戏客户端项目"),

        projectEntry(
          "《求生王》—— Cocos Creator 预研项目",
          "2025.03 - 2025.08",
          "生存类新项目预研阶段，负责前端框架与底层基础能力搭建。",
          [
            "采用 PureMVC 三层架构（Model-View-Controller），划分核心层/通用层/业务层，实现框架与业务分离。",
            "设计配置注册器统一管理界面元数据，实现多层级管理、界面栈、缓存池与动态加载。",
            "封装资源管理器集成 assetManager，按 bundle 加载/卸载资源，引入引用计数与预加载策略。",
            "搭建 Protobuf + WebSocket 长连接与 HTTP 请求模块，支持断线重连、消息队列与错误重试。",
            "接入 Cocos 热更新能力，封装版本校验、增量下载、失败重试流程，支持灰度发布与断点续传。",
            "使用 TiledMap 实现地图渲染与道具建造，集成 A* 寻路与行为树实现角色自动寻路与交互。",
            "封装事件管理器、对象池、数学工具等通用模块，提供完整的工具库支持。",
          ],
        ),

        projectEntry(
          "海外 H5 项目（家园 + 寻物 + 运营系统）",
          "2021.09 - 2025.08",
          "面向海外市场的长期运营休闲 H5 项目，包含家园放置、寻物 / 物品归类玩法以及复杂运营活动系统。Egret + TypeScript。",
          [
            "家园放置玩法中，基于 A* 算法实现人物智能寻路与障碍绕行，引入 FSM 管理多状态切换。",
            "封装地图滑动交互组件，处理世界坐标与屏幕坐标映射、边界控制、惯性滑动与回弹等逻辑。",
            "自研多边形顶点编辑工具，支持策划配置默认摆放方案与复杂点击区域。",
            "寻物 / 物品归类玩法中，使用向量叉乘实现多边形命中检测；以配置驱动方式封装拖拽、吸附、结算流程。",
            "使用对象池管理高频节点，配合资源动态预加载与按需释放，降低运行时 GC 抖动。",
            "搭建多语言与配置表工具链：JSON 多语言管理器、Python 生成 TypeScript Interface 的配置表系统、命令行图集打包工具。",
          ],
        ),

        projectEntry(
          "《爱江山》—— 女性向换装 / 化妆游戏",
          "2020.09 - 2021.09",
          "面向女性用户的换装 / 化妆休闲游戏，强调角色表现与妆容细节。Egret + TypeScript + DragonBones。",
          [
            "设计角色半身分层显示层级，结合 Tween 缓动、遮罩与 DragonBones 动画，实现局部妆容的动态表现。",
            "引入有限状态机（FSM）管理角色显示与换装状态，拆分为独立状态与切换规则，降低业务耦合度。",
            "封装通用 Tween 动画模块，通过链式调用组合复杂动画效果。",
            "实现配置驱动的主题替换系统，将龙骨资源组合与逻辑解耦，支持活动主题快速替换。",
            "设计任务系统、排行榜与运营活动等通用数据结构，支持同一套结构在多玩法、多活动中复用。",
          ],
        ),

        projectEntry(
          "《赤焰号角》—— MMORPG H5 项目",
          "2018.06 - 2020.06",
          null,
          [
            "按 MVC 思想搭建界面层结构，封装通用弹窗、按钮组、提示框等可复用组件，统一界面风格与交互逻辑。",
            "参与实现角色属性、背包、技能、任务等系统界面，保证与服务端数据交互的正确性与一致性。",
            "参与网络通信层开发，补充协议枚举、基础协议解析和错误码处理逻辑。",
            "配合接入多渠道 SDK（登录、支付、统计等），在统一封装的接口上完成联调与问题排查。",
          ],
        ),

        // 个人项目
        subHeading("个人项目"),

        new Paragraph({
          spacing: { before: 100 },
          children: [
            bold("量化交易系统"),
            muted("    Python + Freqtrade + CCXT + Redis Stream + Docker + gRPC"),
          ],
        }),
        new Paragraph({
          spacing: { after: 60 },
          children: [muted("从 0 到 1 搭建的完整自动化交易系统，覆盖策略研发 → 信号生成 → 数据管道 → 自动执行 → 通知全链路。")],
        }),
        bullet("基于 Freqtrade + CCXT 构建多周期联动策略框架（1H / 4H / 日线），集成 MACD Histogram、RSI 背离检测（pivot 高低点 + 趋势斜率验证）、EMA 多因子评分系统。"),
        bullet("使用 Redis Stream 构建实时信号处理管道，gRPC 微服务架构解耦策略、执行与通知模块，Docker 多容器部署。"),
        bullet("实现以损定仓、盈亏比控制（≥1.5）、强势币筛选三级风控体系。"),
        bullet("Python pandas / numpy 回测数据分析，XGBoost + SHAP 进行特征重要性分析与策略参数优化。"),
        bullet("Telegram（Telethon）实时信号推送与交易通知。"),

        // ═══ 荣誉 ═══
        emptyLine(),
        divider(),
        sectionHeading("荣誉"),
        bullet("广州A公司 2021、2022 年度优秀员工", { bold: true }),
      ],
    },
  ],
});

// ── skill blocks ─────────────────────────────────────────

function skillBlocks() {
  const skills = [
    {
      title: "游戏客户端",
      items: [
        "Cocos Creator / Egret（6年），TypeScript（高级），DragonBones 骨骼动画",
        "UI 系统设计（层级管理 / 组件化 / 缓存池），PureMVC / MVC 架构",
        "性能优化（对象池、资源引用计数、动态加载、GC 抖动控制）",
        "插件与工具链开发（extensions、命令行图集打包、配置表代码生成）",
      ],
    },
    {
      title: "工程化 & 架构",
      items: [
        "AST 静态分析（ts-morph），依赖分析（dependency-cruiser），模块解耦设计",
        "配置驱动开发：配置注册器、多层级界面管理、关卡编辑器、主题替换系统",
        "工具链建设：Python + TypeScript 混合工具链，自动化构建流程",
      ],
    },
    {
      title: "后端 & 系统架构",
      items: [
        "gRPC 微服务设计，Docker 多容器部署，服务解耦",
        "Redis Stream 实时数据管道，Protobuf + WebSocket 长连接通信",
        "SQLite 数据存储，可扩展 JSON 结构设计",
      ],
    },
    {
      title: "Python & 数据处理",
      items: [
        "pandas / numpy 数据处理与回测分析，批处理脚本",
        "XGBoost + SHAP 特征重要性分析，多因子组合优化",
      ],
    },
    {
      title: "量化交易系统（个人项目）",
      items: [
        "Freqtrade + CCXT 策略框架，多周期联动（1H / 4H / 日线）",
        "技术指标：MACD Histogram、RSI 背离检测（pivot 高低点 + 趋势斜率验证）、EMA / ATR",
        "风控：以损定仓、盈亏比控制 ≥1.5、强势币筛选",
      ],
    },
    {
      title: "其他",
      items: [
        "Android Studio（Logcat / Crash / ANR 定位），Git，Python，Node.js",
      ],
    },
  ];

  return skills.flatMap((s) => [
    new Paragraph({
      spacing: { before: 100, after: 40 },
      children: [bold(s.title, { size: 22, color: ACCENT })],
    }),
    ...s.items.map((item) => bullet(item)),
  ]);
}

// ── work entry ───────────────────────────────────────────

function workEntry(header, items) {
  return [
    new Paragraph({
      spacing: { before: 120, after: 60 },
      children: [bold(header, { size: 22 })],
    }),
    ...items.map((item) => bullet(item)),
  ];
}

// ── project entry ────────────────────────────────────────

function projectEntry(title, date, intro, items) {
  const children = [
    new Paragraph({
      spacing: { before: 160, after: 40 },
      children: [bold(title, { size: 22 })],
    }),
    new Paragraph({
      spacing: { after: 60 },
      children: [muted(date)],
    }),
  ];
  if (intro) {
    children.push(
      new Paragraph({
        spacing: { after: 60 },
        children: [txt(intro)],
      }),
    );
  }
  children.push(...items.map((item) => bullet(item)));
  return children;
}

// ── build ────────────────────────────────────────────────

Packer.toBuffer(doc).then((buffer) => {
  const outPath = __dirname + "/简历-完整版.docx";
  fs.writeFileSync(outPath, buffer);
  console.log("Written: " + outPath);
});
