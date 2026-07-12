// 自理能力评估问卷 - 10道题
export const EVAL_QUESTIONS = [
  {
    id: 1, category: '自理能力', title: '进食：使用适当的器具将食物送入嘴中并咽下',
    options: [
      { label: 'A. 独立完成，不需要协助', score: 5 },
      { label: 'B. 在他人语言指导或照看下完成', score: 4 },
      { label: 'C. 需要他人协助，但以自身完成为主', score: 3 },
      { label: 'D. 主要依靠协助，自身能予配合', score: 2 },
      { label: 'E. 完全依赖他人协助，且无法给予配合', score: 1 }
    ]
  },
  {
    id: 2, category: '自理能力', title: '洗澡：清洗和擦干身体',
    options: [
      { label: 'A. 独立完成，不需要协助', score: 5 },
      { label: 'B. 在他人语言指导或照看下完成', score: 4 },
      { label: 'C. 需要他人协助，但以自身完成为主', score: 3 },
      { label: 'D. 主要依靠协助，自身能予配合', score: 2 },
      { label: 'E. 完全依赖他人协助，且无法给予配合', score: 1 }
    ]
  },
  {
    id: 3, category: '自理能力', title: '修饰：指洗脸、刷牙、梳头、刮脸、剪指（趾）甲等',
    options: [
      { label: 'A. 独立完成，不需要协助', score: 5 },
      { label: 'B. 在他人语言指导或照看下完成', score: 4 },
      { label: 'C. 需要他人协助，但以自身完成为主', score: 3 },
      { label: 'D. 主要依靠协助，自身能予配合', score: 2 },
      { label: 'E. 完全依赖他人协助，且无法给予配合', score: 1 }
    ]
  },
  {
    id: 4, category: '感知觉与社会参与', title: '时间/空间定向：知道并确认时间、空间的能力',
    options: [
      { label: 'A. 时间观念清楚，可单独出远门', score: 5 },
      { label: 'B. 时间观念有些下降，可单独来往于近街', score: 4 },
      { label: 'C. 时间观念较差，只能单独在家附近行动', score: 3 },
      { label: 'D. 时间观念很差，只能在左邻右舍间串门', score: 2 },
      { label: 'E. 无时间观念，不能单独外出', score: 1 }
    ]
  },
  {
    id: 5, category: '感知觉与社会参与', title: '人物定向：知道并确认人物的能力',
    options: [
      { label: 'A. 知道周围人们的关系，可用适当称呼', score: 5 },
      { label: 'B. 只知家中亲密近亲的关系', score: 4 },
      { label: 'C. 只能称呼家中人，不知其关系', score: 3 },
      { label: 'D. 只认识常同住的亲人', score: 2 },
      { label: 'E. 只认识主要照顾者', score: 1 }
    ]
  },
  {
    id: 6, category: '精神状态', title: '记忆：短时和长时记忆、瞬时、近期和远期记忆能力',
    options: [
      { label: 'A. 总是能够保持适应的长、短时记忆', score: 5 },
      { label: 'B. 出现轻度的记忆紊乱或回忆不能', score: 4 },
      { label: 'C. 出现中度的记忆紊乱或回忆不能', score: 3 },
      { label: 'D. 出现重度的记忆紊乱或回忆不能', score: 2 },
      { label: 'E. 记忆完全紊乱或者完全不能回忆', score: 1 }
    ]
  },
  {
    id: 7, category: '感知觉与社会参与', title: '视力：感受存在的光线并感受物体的大小、形状',
    options: [
      { label: 'A. 视力正常', score: 5 },
      { label: 'B. 能看清楚大字体，但看不清标准字体', score: 4 },
      { label: 'C. 视力有限，看不清大标题但能辨认物体', score: 3 },
      { label: 'D. 只能看到光、颜色和形状', score: 2 },
      { label: 'E. 完全失明', score: 1 }
    ]
  },
  {
    id: 8, category: '感知觉与社会参与', title: '听力：能够辨别声音的方位、音调、音量和音质',
    options: [
      { label: 'A. 听力正常', score: 5 },
      { label: 'B. 轻声说话或距离超过2米时听不清', score: 4 },
      { label: 'C. 正常交流有些困难，需大声说话', score: 3 },
      { label: 'D. 讲话者大声说话才能部分听见', score: 2 },
      { label: 'E. 完全失聪', score: 1 }
    ]
  },
  {
    id: 9, category: '自理能力', title: '执行日常事务：计划、安排并完成日常事务',
    options: [
      { label: 'A. 能完全独立计划、安排和完成日常事务', score: 5 },
      { label: 'B. 需要他人监护或指导', score: 4 },
      { label: 'C. 需要小量协助', score: 3 },
      { label: 'D. 需要大量协助', score: 2 },
      { label: 'E. 完全依赖他人进行日常事务', score: 1 }
    ]
  },
  {
    id: 10, category: '感知觉与社会参与', title: '使用交通工具外出',
    options: [
      { label: 'A. 能自己骑车或搭乘公共交通工具外出', score: 5 },
      { label: 'B. 能自己搭乘出租车，但不会搭乘公交', score: 4 },
      { label: 'C. 有人协助时可搭乘公共交通工具', score: 3 },
      { label: 'D. 只能在别人协助下搭乘出租车', score: 2 },
      { label: 'E. 完全不能出门，外出完全需要协助', score: 1 }
    ]
  }
]

// 根据总分判断能力初步等级
export function judgeLevel(total) {
  if (total <= 10) return '能力完好'
  if (total <= 20) return '轻度失能'
  if (total <= 30) return '中度失能'
  if (total <= 40) return '中重度失能'
  return '重度失能'
}

// 疾病诊断选项
export const DISEASES = [
  '无疾病', '冠心病I25.1', '糖尿病E10-E14', '肺炎J14', '高血压I10',
  '脑出血I60-I62', '脑梗塞I63', '尿路感染', '帕金森综合症G20-G22',
  '慢性肾功能衰竭N18-N19', '癫痫G40', '消化道出血K20-K31',
  '肿瘤C00-D48', '截肢（6个月内）', '骨折（3个月内）', '艾滋病B24'
]