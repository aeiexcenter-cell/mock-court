import { CaseInfo, BackendEvidence } from '../../../types';

// 导入证据内容 (Vite raw import)
import e001 from './evidence/一号案例说明 .md?raw';
import e002 from './evidence/案情概要.md?raw';
import e003 from './evidence/江山市公安局北湖分局起诉意见书.md?raw';
import e004 from './evidence/武鸣市彩云县常住人口户籍资料.md?raw';
import e005 from './evidence/现场勘验笔录.md?raw';
import e006 from './evidence/法医学尸体检验鉴定书.md?raw';
import e007 from './evidence/黄晨询问笔录.md?raw';
import e008 from './evidence/潘彩云询问笔录.md?raw';
import e009 from './evidence/刘海月询问笔录.md?raw';
import e010 from './evidence/程振贤询问笔录.md?raw';
import e011 from './evidence/程振贤第一次讯问笔录.md?raw';
import e012 from './evidence/程振贤第二次讯问笔录.md?raw';
import e013 from './evidence/程振贤第三次讯问笔录.md?raw';
import e014 from './evidence/程振贤第四次讯问笔录.md?raw';
import e015_raw from './evidence/现勘照片.md?raw';
import e016 from './evidence/E016.md?raw';
import e017 from './evidence/光明路东一街现场平面图.md?raw';

// 导入证据图片
import img_scene_1 from './media/2026-02-09-14-47-15-image.png';
import img_scene_2 from './media/2026-02-09-14-47-47-image.png';

// 替换 Markdown 中的图片路径
const e015 = e015_raw
    .replace('/evidence_images/2026-02-09-14-47-15-image.png', img_scene_1)
    .replace('/evidence_images/2026-02-09-14-47-47-image.png', img_scene_2);

export const CASE_DATA: {
    meta: CaseInfo;
    evidence: BackendEvidence[];
} = {
    meta: {
        // ... (omitted for brevity, no changes here)
        abstract: "2016年3月24日，程振贤饮酒后驾驶无号牌电动车搭载醉酒的张龙上路行驶，与停在路边的小货车发生碰撞。程振贤与张龙摔倒在地，随后，程振贤将张龙送至旅店房间入住后离开。次日，旅店店主发现张龙异样后报警。张龙经医院抢救无效死亡。后经法医鉴定张龙符合钝性暴力作用头部致严重颅脑损伤死亡。",

        // 控方信息
        prosecutor_title: "江山市北湖区人民检察院",
        prosecutor_name: "王某",
        statement_charge: `被告人程振贤，男，1989年9月23日出生，身份证号码456878198909236532，汉族，初中文化，户籍所在地海宁省武鸣市彩云县禄水乡清湖区雷打浦四巷8号，现住江山市北湖区小石镇华盛电子厂宿舍。因涉嫌过失致人死亡罪，于2016年3月25日被江山市公安局北湖分局刑事拘留，同年4月4日经本院批准逮捕，现羁押于北湖区看守所。

本案由江山市公安局北湖分局侦查终结，以被告人程振贤涉嫌过失致人死亡罪，于2016年4月6日移送本院审查起诉。本院受理后，已依法告知被告人有权委托辩护人，告知被害人近亲属有权委托诉讼代理人，依法讯问了被告人，听取了辩护人及被害人近亲属的意见，审查了全部案件材料。

经依法审查查明：
2016年3月24日22时许，被告人程振贤与张龙（死者）等人在江山市北湖区小石镇潭头白芸村一烧烤店饮酒，四人共饮用三扎啤酒（每扎3升）。至次日凌晨2时许，程振贤在明知自身饮酒的情况下，驾驶夜灯缺失的无号牌电动自行车，搭载已醉酒的张龙返回住所，因车速过快且未注意观察路况，于小潭高中附近斜坡路口与停放在路中的小货车发生碰撞，二人摔倒在地，张龙的头部与小货车发生碰撞。事故发生后，程振贤发现张龙倒地后无反应，但未采取任何医疗救助措施，仅将其送至小潭汽车站对面出租屋后径直离开。次日上午11时许，张龙被旅店店主黄晨发现异常，经医生到场确认已死亡，经法医鉴定张龙符合钝性暴力作用头部致严重颅脑损伤死亡。

本院认为，被告人程振贤在明知饮酒后驾驶能力会下降的情况下，醉酒驾驶电动车载被害人高速行驶导致事故发生，并在被害人因事故失去意识后疏于检查且未及时送医，导致被害人因未及时获得救治而死亡，其行为已触犯《中华人民共和国刑法》第二百三十三条之规定，犯罪事实清楚，证据确实、充分，应当以过失致人死亡罪追究其刑事责任。根据《中华人民共和国刑事诉讼法》第一百七十二条之规定，本院依法提起公诉，请依法判处。`,
        crime: "过失致人死亡罪",

        // 辩方信息
        defendant_name: "程振贤",
        defendant_birthdate: "1989-09-23",
        defendant_birthplace: "海宁省武鸣市彩云县",
        defendant_ethnicity: "汉族",
        defendant_education: "初中",
        defendant_occupation: "工人",
        defendant_employer: "华盛电子厂",
        defendant_residence: "海宁省江山市北湖区小石镇华盛电子厂宿舍",
        defendant_ID_number: "456878198909236532",
        defendant_legal_record: "无",
        detention_date: "2016-03-25",
        indictment_date: "2016-04-20",
        attorney_name: "李某（北京典谟律师事务所）",

        // 审理法院信息
        court_name: "江山市北湖区人民法院",
        judge_name: "张审判长",
        judge_name_2: "王陪审员",
        clerk_name: "李书记员",
        case_id: "江公北诉字[2016]03449号"
    },
    evidence: [
        { id: "E001", name: "一号案例说明", content: e001, provider: "prosecutor" },
        { id: "E002", name: "案情概要", content: e002, provider: "prosecutor" },
        { id: "E003", name: "起诉意见书", content: e003, provider: "prosecutor" },
        { id: "E004", name: "常住人口户籍资料", content: e004, provider: "prosecutor" },
        { id: "E005", name: "现场勘验笔录", content: e005, provider: "prosecutor" },
        { id: "E006", name: "法医学尸体检验鉴定书", content: e006, provider: "prosecutor" },
        { id: "E007", name: "黄晨询问笔录", content: e007, provider: "prosecutor" },
        { id: "E008", name: "潘彩云询问笔录", content: e008, provider: "prosecutor" },
        { id: "E009", name: "刘海月询问笔录", content: e009, provider: "prosecutor" },
        { id: "E010", name: "程振贤询问笔录", content: e010, provider: "prosecutor" },
        { id: "E011", name: "程振贤第一次讯问笔录", content: e011, provider: "prosecutor" },
        { id: "E012", name: "程振贤第二次讯问笔录", content: e012, provider: "prosecutor" },
        { id: "E013", name: "程振贤第三次讯问笔录", content: e013, provider: "prosecutor" },
        { id: "E014", name: "程振贤第四次讯问笔录", content: e014, provider: "prosecutor" },
        { id: "E015", name: "现勘照片和图表", content: e015, provider: "prosecutor" },
        { id: "E016", name: "无罪辩护词主体", content: e016, provider: "defendant" },
        { id: "E017", name: "光明路东一街现场平面图", content: e017, provider: "prosecutor" }
    ]
};
