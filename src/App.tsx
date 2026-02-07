import React, { useState, useMemo, useCallback } from 'react';
import DraggableWindow from './components/DraggableWindow';
import LeftSidebar from '@/features/LeftSidebar';
import ChatArea from '@/features/ChatArea';
import RightSidebar from '@/features/RightSidebar';
import { useCourtSession, ROLE_MAPPINGS } from '@/hooks/useCourtSession';
import { useWindowManager } from './hooks/useWindowManager';
import type {
    TextEvidence,
    FileEvidence,
    UserRole,
    LayoutConfig,
    CaseDataConfig,
    EvidenceDataConfig,
    NewEvidenceInputConfig,
    SessionInfoConfig,
    CaseInfo,
    BackendEvidence,
    EvidenceInputPayload
} from './types';

// --- 预设测试数据 (来自 demo.html - 程振贤过失致人死亡案) ---
const DEFAULT_CASE_INFO: CaseInfo = {
    // 案件本身信息
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
};

// --- 预设证据列表 (来自 demo.html) ---
const DEFAULT_EVIDENCE_LIST: BackendEvidence[] = [
    { id: "E001", name: "一号案例说明", content: "本案控方以程振贤构成过失致人死亡罪起诉，辩方进行无罪辩护；庭审准备遵循案情概要所述立场；只涉及程振贤一人一案，无刑事附带民事诉讼；程序合法，无违法行为；证据原始且取证合法；地名人名虚拟。", provider: "prosecutor" },
    { id: "E002", name: "案情概要", content: "公诉机关江山市北湖区人民检察院，被告人程振贤；2016年3月24日程振贤饮酒后驾无号牌电动车搭载醉酒张龙，与路边小货车碰撞，后送张龙至旅店离开；次日张龙死亡，经鉴定为钝性暴力致严重颅脑损伤死亡。", provider: "prosecutor" },
    { id: "E003", name: "起诉意见书", content: "江公北诉字[2016]03449号；嫌疑人程振贤基本信息；案情：2016年3月24日晚与张龙喝酒后驾电动车碰撞小货车，未送医而送至出租屋；次日张龙死亡；证据包括供述、现场勘验、法医鉴定、证言；涉嫌过失致人死亡罪。", provider: "prosecutor" },
    { id: "E004", name: "常住人口户籍资料", content: "程振贤，男，1989年9月23日生，身份证456878198909236532，汉族，户籍海宁省武鸣市彩云县禄水乡清湖区雷打浦四巷8号。", provider: "prosecutor" },
    { id: "E005", name: "现场勘验笔录", content: "江公(北)勘[2016]7547号；勘验兴旺美食店西侧旅馆208房间及相关现场，发现尸体、血迹、刮擦痕迹；包括示意图和照片。", provider: "prosecutor" },
    { id: "E006", name: "法医学尸体检验鉴定书", content: "江公北(司)鉴(法)[2016]2478号；张龙尸体检验：多处挫擦伤、头皮下血肿、颅骨骨折、硬膜下血肿、脑疝形成；死因钝性暴力致严重颅脑损伤死亡。", provider: "prosecutor" },
    { id: "E007", name: "黄晨询问笔录", content: "黄晨（房东）描述：2016年3月25日凌晨三男一女租208房，醉酒男子入住后其他人离开；上午发现男子异样，报警；医生确认死亡。", provider: "prosecutor" },
    { id: "E008", name: "潘彩云询问笔录", content: "潘彩云（房东妻子）描述：上午查房发现208房客人无反应，通知丈夫；三人送客入住，无人照顾；房间无凌乱痕迹。", provider: "prosecutor" },
    { id: "E009", name: "刘海月询问笔录", content: "刘海月描述：凌晨程振贤叫帮忙开房，扶醉酒朋友入住后离开；上午房东通知，发现死亡。", provider: "prosecutor" },
    { id: "E010", name: "程振贤询问笔录", content: "程振贤描述：与小龙（张龙）喝酒后驾电动车碰撞小货车，倒地后送小龙至旅店休息；上午发现死亡。", provider: "prosecutor" },
    { id: "E011", name: "程振贤第一次讯问笔录", content: "程振贤供述：喝酒细节、碰撞过程、未送医原因、送至旅店经过；以为醉酒未受伤。", provider: "prosecutor" },
    { id: "E012", name: "程振贤第二次讯问笔录", content: "程振贤供述：喝酒量、碰撞细节、小龙醉酒状态、检查伤势；无摩托驾照。", provider: "prosecutor" },
    { id: "E013", name: "程振贤第三次讯问笔录", content: "程振贤供述：扶小龙至旅店过程、未送医原因。", provider: "prosecutor" },
    { id: "E014", name: "程振贤第四次讯问笔录", content: "程振贤供述：确认碰撞致伤、接受逮捕。", provider: "prosecutor" },
    { id: "E015", name: "现勘照片和图表", content: "包括旅馆房间照片、血迹、现场路况、小货车刮擦痕迹、尸体位置等视觉证据。", provider: "prosecutor" },
    { id: "E016", name: "无罪辩护词主体", content: "辩护人认为被告无罪：无主观过失、未预见死亡风险、积极救助行为、死因可能为醉酒或他因；引用法律和类似案例论证。", provider: "defendant" }
];

// --- 主要应用程序组件 ---
export default function MockCourtApp(): React.ReactElement {
    // --- 会话 Hook (单行访问所有会话逻辑) ---
    const { sessionState, actions } = useCourtSession();

    // 为了方便解构
    const {
        messages, isConnected, isConnecting, sessionId,
        currentPhase, currentSpeaker, activeNode, isTurnToSpeak, logs,
        interruptState, progress, evidenceList, lastInterruptReq
    } = sessionState;

    const { connect, sendMessage, respondToInterrupt, clearSession, retry } = actions;

    // --- 窗口管理器 Hook ---
    const { windows, windowActions, inputWindow, inputWindowActions } = useWindowManager();

    // --- UI 状态 (本组件局部) ---
    const [leftWidth, setLeftWidth] = useState<number>(320);
    const [rightWidth, setRightWidth] = useState<number>(300);

    const [roleFilter, setRoleFilter] = useState<string>('all');
    const [evidenceFilter, setEvidenceFilter] = useState<string>('all');
    const [selectedRole, setSelectedRole] = useState<UserRole>('Defense AI');

    // 输入项
    const [inputValue, setInputValue] = useState<string>('');
    const [caseContext, setCaseContext] = useState<string>(DEFAULT_CASE_INFO.abstract);

    // 将预设证据列表转换为前端格式
    const [textEvidence, setTextEvidence] = useState<TextEvidence[]>(
        DEFAULT_EVIDENCE_LIST.map(ev => ({
            id: ev.id,
            name: ev.name,
            speaker: ev.provider === 'prosecutor' ? '原告律师' : '被告律师',
            content: ev.content
        }))
    );
    const [fileEvidence, setFileEvidence] = useState<FileEvidence[]>([]);
    const [newEvidenceInput, setNewEvidenceInput] = useState<string>('');
    const [newEvidenceSpeaker, setNewEvidenceSpeaker] = useState<string>('原告律师');

    const [isLongFormMode, setIsLongFormMode] = useState<boolean>(false);

    // --- 将前端证据转换为后端格式 ---
    const convertToBackendEvidence = useCallback((): BackendEvidence[] => {
        const converted: BackendEvidence[] = [];

        textEvidence.forEach((ev, idx) => {
            converted.push({
                id: `text-${idx + 1}`,
                name: `文本证据 ${idx + 1}`,
                content: ev.content,
                provider: ev.speaker.includes('被告') ? 'defendant' : 'prosecutor'
            });
        });

        fileEvidence.forEach((ev, idx) => {
            converted.push({
                id: `file-${idx + 1}`,
                name: ev.name,
                content: `[文件证据] ${ev.name}`,
                provider: ev.speaker.includes('被告') ? 'defendant' : 'prosecutor'
            });
        });

        return converted;
    }, [textEvidence, fileEvidence]);

    // --- 动作 (使用 Hook 函数) ---
    const handleStartTrial = useCallback((): void => {
        // 使用预设测试数据（来自 demo.html）
        connect(selectedRole, DEFAULT_CASE_INFO, DEFAULT_EVIDENCE_LIST);
    }, [connect, selectedRole, caseContext, convertToBackendEvidence]);

    const handleSendMessage = useCallback((): void => {
        const success = sendMessage(inputValue, selectedRole);
        if (success) {
            setInputValue('');
        }
    }, [sendMessage, inputValue, selectedRole]);

    const handleRespondToInterrupt = useCallback((input: boolean | string | EvidenceInputPayload): void => {
        respondToInterrupt(input);
    }, [respondToInterrupt]);

    const handleClearSession = useCallback((): void => {
        if (window.confirm('确定要清除当前会话吗？所有消息将被清除。')) {
            clearSession();
        }
    }, [clearSession]);

    // 角色切换处理程序 (替换 useEffect 同步)
    const handleRoleChange = useCallback((newRole: UserRole) => {
        setSelectedRole(newRole);
        if (newRole === 'Prosecutor AI') setNewEvidenceSpeaker('原告律师');
        else if (newRole === 'Defense AI') setNewEvidenceSpeaker('被告律师');
    }, []);

    // 证据处理 (缓存)
    const deleteEvidence = useCallback((index: number, isFile: boolean): void => {
        if (window.confirm("确定要移除这项证据吗？")) {
            if (isFile) setFileEvidence(prev => prev.filter((_, i) => i !== index));
            else setTextEvidence(prev => prev.filter((_, i) => i !== index));
        }
    }, []);

    const handleTextEvidenceEdit = useCallback((index: number, value: string): void => {
        setTextEvidence(prev => {
            const newArr = [...prev];
            newArr[index] = { ...newArr[index], content: value };
            return newArr;
        });
    }, []);

    const handleAddTextEvidence = useCallback((evidence: TextEvidence): void => {
        setTextEvidence(prev => [...prev, evidence]);
    }, []);

    const handleAddFileEvidence = useCallback((evidence: FileEvidence): void => {
        setFileEvidence(prev => [...prev, evidence]);
    }, []);

    // --- 布局调整 ---
    type ResizeDirection = 'left' | 'right' | 'input';

    const startResizing = useCallback((direction: ResizeDirection) => (e: React.MouseEvent): void => {
        e.preventDefault();
        const startX = e.clientX;
        const startW = direction === 'left' ? leftWidth : rightWidth;

        const onMove = (ev: MouseEvent): void => {
            if (direction === 'left' || direction === 'right') {
                const d = ev.clientX - startX;
                if (direction === 'left') setLeftWidth(Math.max(250, Math.min(600, startW + d)));
                else setRightWidth(Math.max(250, Math.min(500, startW - d)));
            }
        };

        const onUp = (): void => {
            document.removeEventListener('mousemove', onMove);
            document.removeEventListener('mouseup', onUp);
        };

        document.addEventListener('mousemove', onMove);
        document.addEventListener('mouseup', onUp);
    }, [leftWidth, rightWidth]);

    // --- 为 LeftSidebar 缓存的 Props (性能优化) ---
    const leftLayoutConfig: LayoutConfig = useMemo(() => ({
        width: leftWidth,
        onStartResize: startResizing('left')
    }), [leftWidth, startResizing]);

    const caseDataConfig: CaseDataConfig = useMemo(() => ({
        context: caseContext,
        onChange: setCaseContext
    }), [caseContext]);

    const evidenceDataConfig: EvidenceDataConfig = useMemo(() => ({
        file: fileEvidence,
        text: textEvidence,
        filter: evidenceFilter as 'all' | '原告律师' | '被告律师',
        onFilterChange: setEvidenceFilter,
        onDelete: deleteEvidence,
        onOpen: windowActions.open,
        onTextEdit: handleTextEvidenceEdit
    }), [fileEvidence, textEvidence, evidenceFilter, deleteEvidence, windowActions.open, handleTextEvidenceEdit]);

    const newEvidenceInputConfig: NewEvidenceInputConfig = useMemo(() => ({
        value: newEvidenceInput,
        onChange: setNewEvidenceInput,
        speaker: newEvidenceSpeaker,
        onSpeakerChange: setNewEvidenceSpeaker,
        onAddText: handleAddTextEvidence,
        onAddFile: handleAddFileEvidence
    }), [newEvidenceInput, newEvidenceSpeaker, handleAddTextEvidence, handleAddFileEvidence]);

    const sessionInfoConfig: SessionInfoConfig = useMemo(() => ({
        isConnected,
        isTurnToSpeak,
        logs,
        selectedRole
    }), [isConnected, isTurnToSpeak, logs, selectedRole]);


    return (
        <div className="flex h-screen w-full bg-surface-container-low font-sans text-on-surface overflow-hidden relative selection:bg-primary-container selection:text-on-primary-container">

            {/* 窗口层 */}
            {windows.map(win => (
                <DraggableWindow
                    key={win.id}
                    win={win}
                    onClose={windowActions.close}
                    onFocus={windowActions.focus}
                    updatePosition={windowActions.updatePosition}
                    updateSize={windowActions.updateSize}
                />
            ))}

            {/* 左侧边栏 */}
            <LeftSidebar
                layout={leftLayoutConfig}
                caseData={caseDataConfig}
                evidenceData={evidenceDataConfig}
                newEvidenceInput={newEvidenceInputConfig}
                sessionInfo={sessionInfoConfig}
                caseInfo={{
                    case_id: DEFAULT_CASE_INFO.case_id,
                    court_name: DEFAULT_CASE_INFO.court_name,
                    defendant_name: DEFAULT_CASE_INFO.defendant_name,
                    crime: DEFAULT_CASE_INFO.crime
                }}
            />

            {/* 中间区 (聊天) */}
            <ChatArea
                messages={messages}
                roleFilter={roleFilter}
                onRoleFilterChange={setRoleFilter}
                currentPhase={currentPhase}
                currentSpeaker={currentSpeaker}
                sessionId={sessionId}
                isConnected={isConnected}
                inputValue={inputValue}
                onInputChange={setInputValue}
                onSendMessage={handleSendMessage}
                isTurnToSpeak={isTurnToSpeak}
                isLongFormMode={isLongFormMode}
                onExpandInput={() => setIsLongFormMode(true)}
                onCloseLongForm={() => setIsLongFormMode(false)}
                selectedRole={selectedRole}
                inputWindowState={inputWindow}
                onFocusInputWindow={inputWindowActions.focus}
                onUpdateInputWindowPos={inputWindowActions.updatePosition}
                onUpdateInputWindowSize={inputWindowActions.updateSize}
                // 新增 props
                interruptState={interruptState}
                evidenceList={evidenceList}
                onRespondToInterrupt={handleRespondToInterrupt}
                progress={progress}
            />

            {/* 右侧边栏 */}
            <RightSidebar
                width={rightWidth}
                onStartResize={startResizing('right')}
                selectedRole={selectedRole}
                onRoleChange={handleRoleChange}
                roleOptions={Object.keys(ROLE_MAPPINGS) as UserRole[]}
                isConnected={isConnected}
                isConnecting={isConnecting}
                isTurnToSpeak={isTurnToSpeak}
                currentPhase={currentPhase}
                activeNode={activeNode}
                progress={progress}
                onStartTrial={handleStartTrial}
                onNextStep={handleClearSession}
                lastInterruptReq={lastInterruptReq}
                onRetry={retry}
            />

        </div>
    );
}
