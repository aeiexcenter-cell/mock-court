import React from 'react';
import { Play, RotateCcw, Activity, User, Gavel, ShieldAlert, ShieldCheck, BookOpen, Scale } from 'lucide-react';
import type { UserRole, ActiveNode, TrialPhase, ButtonSize, ButtonVariant } from '../../types';
import { RoleSelector } from '../../components/RoleSelector';

export interface RightSidebarProps {
    width: number;
    onStartResize: (e: React.MouseEvent) => void;
    // Role Selection
    selectedRole: UserRole;
    onRoleChange: (role: UserRole) => void;
    roleOptions: UserRole[];
    // Session State
    isConnected: boolean;
    isConnecting: boolean;
    isTurnToSpeak: boolean;
    currentPhase: TrialPhase | string;
    activeNode: ActiveNode;
    // Progress
    progress?: number;
    // Actions
    onStartTrial: () => void;
    onNextStep: () => void;
}

interface FlowNode {
    id: ActiveNode;
    label: string;
    desc: string;
    icon: React.ReactNode;
}

// --- 流程节点配置 (匹配后端庭审流程) ---
const FLOW_NODES: FlowNode[] = [
    { id: 'standby', label: '待命', desc: '准备开始', icon: <Activity size={18} /> },
    { id: 'clerk', label: '书记员', desc: '宣布法庭纪律', icon: <BookOpen size={18} /> },
    { id: 'judge', label: '审判长', desc: '主持法庭', icon: <Gavel size={18} /> },
    { id: 'prosecutor', label: '公诉人', desc: '宣读起诉书/举证', icon: <ShieldAlert size={18} /> },
    { id: 'defendant', label: '被告人', desc: '接受讯问/自我辩护', icon: <User size={18} /> },
    { id: 'defense', label: '辩护人', desc: '质证/辩护', icon: <ShieldCheck size={18} /> },
    { id: 'verdict', label: '宣判', desc: '审判结束', icon: <Scale size={18} /> },
];

// --- 用户节点映射 ---
const USER_NODE_MAP: Record<UserRole, ActiveNode> = {
    'Prosecutor AI': 'prosecutor',
    'Defense AI': 'defense',
    'Judge AI': 'judge',
    'Observer': 'standby'
};

// --- 阶段颜色映射 ---
const PHASE_COLORS: Record<string, string> = {
    '开庭阶段': 'text-blue-400',
    '法庭调查': 'text-yellow-400',
    '法庭辩论': 'text-orange-400',
    '宣判阶段': 'text-purple-400',
    '已结束': 'text-green-400'
};

// --- Button 组件 ---
const Button: React.FC<{
    children: React.ReactNode;
    variant?: ButtonVariant;
    size?: ButtonSize;
    className?: string;
    disabled?: boolean;
    onClick?: () => void;
}> = ({ children, variant = 'primary', size = 'md', className = '', ...props }) => {
    const baseStyle = "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50";
    const sizes: Record<ButtonSize, string> = { md: "h-9 px-4 py-2", sm: "h-8 px-3 text-xs", icon: "h-9 w-9", xs: "h-6 px-2 text-[10px]", lg: "h-11 px-6 text-base" };
    const variants: Record<ButtonVariant, string> = {
        primary: "bg-primary text-on-primary hover:opacity-90 shadow-sm",
        secondary: "bg-surface-container text-on-surface hover:bg-surface-container-high",
        ghost: "hover:bg-surface-container-high text-on-surface",
        outline: "border border-outline bg-transparent hover:bg-surface-container text-on-surface",
        danger: "bg-error text-white hover:bg-error/90",
        success: "bg-primary-container text-on-primary-container hover:shadow-md"
    };
    return <button className={`${baseStyle} ${sizes[size]} ${variants[variant]} ${className}`} {...props}>{children}</button>;
};

/**
 * RightSidebar - 包含执行流程可视化和控制面板。
 * 
 * 更新：匹配后端庭审流程，添加进度条和阶段颜色
 */
const RightSidebar: React.FC<RightSidebarProps> = ({
    width,
    onStartResize,
    selectedRole,
    onRoleChange,
    isConnected,
    isConnecting,
    currentPhase,
    activeNode,
    progress = 0,
    onStartTrial,
}) => {
    const isUserNode = (stepId: ActiveNode): boolean => USER_NODE_MAP[selectedRole] === stepId;

    // 计算已完成的节点
    const getNodeStatus = (nodeId: ActiveNode): 'completed' | 'active' | 'pending' => {
        const nodeIndex = FLOW_NODES.findIndex(n => n.id === nodeId);
        const activeIndex = FLOW_NODES.findIndex(n => n.id === activeNode);

        if (nodeIndex < activeIndex) return 'completed';
        if (nodeIndex === activeIndex) return 'active';
        return 'pending';
    };

    return (
        <div style={{ width }} className="flex flex-col bg-surface-container-low shrink-0 relative z-10 transition-colors duration-300">
            {/* 调整大小手柄 */}
            <div
                className="absolute top-0 bottom-0 -left-3 w-6 z-50 flex justify-center cursor-col-resize group touch-none"
                onMouseDown={onStartResize}
            >
                <div className="w-1 h-full rounded-full bg-transparent group-hover:bg-primary transition-colors duration-200 ease-in-out opacity-60" />
            </div>

            {/* 控制面板 */}
            <div className="px-6 pt-8 pb-4 bg-surface-container-low space-y-4">
                {/* 角色选择器 */}
                <div>
                    <label className="text-xs font-bold text-on-surface-variant/70 uppercase mb-3 block tracking-widest opacity-70">您的角色</label>
                    <RoleSelector
                        value={selectedRole}
                        onChange={onRoleChange}
                        disabled={isConnected}
                    />
                </div>

                {/* 开始/结束按钮 - 紧凑 */}
                <Button
                    onClick={onStartTrial}
                    disabled={isConnecting}
                    className={`w-full justify-center h-10 rounded-full shadow-md hover:shadow-lg hover:scale-[1.01] transition-all text-sm font-semibold tracking-wide
            ${isConnected
                            ? '!bg-error-container !text-on-error-container hover:brightness-95'
                            : '!bg-primary-container !text-on-primary-container hover:brightness-95'}`}
                >
                    {isConnecting ? (
                        <Activity className="mr-2 animate-spin" size={16} />
                    ) : isConnected ? (
                        <RotateCcw className="mr-2" size={16} />
                    ) : (
                        <Play className="mr-2 fill-current" size={16} />
                    )}
                    {isConnecting ? '连接中...' : (isConnected ? '结束会话' : '开始庭审')}
                </Button>

                {/* 进度条 (连接后显示) */}
                {isConnected && (
                    <div className="space-y-2">
                        <div className="flex justify-between text-xs">
                            <span className="text-on-surface-variant">庭审进度</span>
                            <span className={`font-medium ${PHASE_COLORS[currentPhase] || 'text-on-surface-variant'}`}>
                                {currentPhase}
                            </span>
                        </div>
                        <div className="h-2 bg-surface-container-highest rounded-full overflow-hidden">
                            <div
                                className="h-full bg-primary rounded-full transition-all duration-500 ease-out"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                        <div className="text-right text-[10px] text-on-surface-variant/60">
                            {progress.toFixed(0)}% 完成
                        </div>
                    </div>
                )}

                {/* 下一步按钮 (已移除) */}
            </div>

            {/* 执行流程页眉 */}
            <div className="h-10 flex items-center px-6 text-on-surface-variant font-bold tracking-widest uppercase text-xs opacity-70 mt-6 border-t border-outline-variant/20 pt-6">
                执行流程
            </div>

            {/* 执行流程节点 */}
            <div className="flex-1 overflow-y-auto px-4 py-2 bg-surface-container-low relative custom-scrollbar">
                <div className="space-y-0 relative pb-6">
                    {/* 连接线 - 调整到新节点中心位置 */}
                    <div className="absolute left-[23px] top-8 bottom-8 w-0.5 bg-outline-variant/40 z-0 rounded-full" />

                    {FLOW_NODES.map((step) => {
                        const status = getNodeStatus(step.id);
                        const isActive = status === 'active';
                        const isCompleted = status === 'completed';
                        const isUser = isUserNode(step.id);

                        return (
                            <div
                                key={step.id}
                                className={`relative flex gap-4 items-start py-3 group ${isActive ? 'opacity-100' : isCompleted ? 'opacity-90' : 'opacity-60'
                                    }`}
                            >
                                {/* 节点圆点 - 增大尺寸 */}
                                <div className="w-12 shrink-0 flex justify-center z-10 relative">
                                    <div className={`relative h-12 w-12 flex items-center justify-center rounded-full transition-all duration-500
                                        ${isActive
                                            ? 'bg-primary-container text-on-primary-container scale-110 shadow-[0_0_20px_rgba(109,94,15,0.35)]'
                                            : isCompleted
                                                ? 'bg-primary/20 text-primary border-2 border-primary/40'
                                                : 'bg-surface-container-highest border-2 border-outline-variant/30 text-on-surface-variant'
                                        }`}
                                    >
                                        {isActive ? (
                                            <div className="animate-pulse scale-125">{step.icon}</div>
                                        ) : isCompleted ? (
                                            <span className="text-primary text-lg font-bold">✓</span>
                                        ) : (
                                            <div className="scale-110">{step.icon}</div>
                                        )}
                                    </div>
                                </div>

                                {/* 节点内容 - 增强文字层级 */}
                                <div className={`pt-2 transition-all duration-300 ${isActive ? 'translate-x-0.5' : ''}`}>
                                    <h4 className={`text-base font-semibold flex items-center gap-2 ${isActive ? 'text-on-surface' : isCompleted ? 'text-on-surface/90' : 'text-on-surface-variant/80'
                                        }`}>
                                        {step.label}
                                        {isUser && (
                                            <span className="text-[9px] bg-start-btn text-on-start-btn px-2 py-0.5 rounded-full font-bold uppercase tracking-wide shadow-sm">
                                                您
                                            </span>
                                        )}
                                    </h4>
                                    <p className={`text-xs leading-relaxed mt-0.5 ${isActive ? 'text-on-surface-variant' : 'text-on-surface-variant/60'}`}>{step.desc}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default RightSidebar;
