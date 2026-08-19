import csv
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
SOURCE = ROOT / 'outputs/01a009c5/内容与策展_课程进度表 2.1.csv'
TARGET = Path(__file__).resolve().parents[1] / 'src/data/course_schedule.json'

def split_points(value):
    points = []
    for line in (value or '').splitlines():
        line = line.strip()
        if line:
            points.extend(part.strip() for part in re.split(r'[；;]', line) if part.strip())
    return points


def parse_homework(value):
    lines = [line.strip() for line in (value or '').splitlines() if line.strip()]
    keys = {'内容': 'content', '形式': 'form', '数量': 'quantity'}
    if any(re.match(r'^(内容|形式|数量)：', line) for line in lines):
        result = {'content': '', 'form': '', 'quantity': ''}
        for line in lines:
            match = re.match(r'^(内容|形式|数量)：(.*)$', line)
            if match:
                result[keys[match.group(1)]] = match.group(2).strip()
        return [result]
    return [{'content': line, 'form': '', 'quantity': ''} for line in lines]


def parse_content_module(value):
    lines = [line.strip() for line in (value or '').splitlines() if line.strip()]
    if len(lines) < 3:
        return None
    return {'name': lines[0], 'instructor': lines[1], 'description': ' '.join(lines[2:]), 'status': '已确认'}


def main():
    rows = list(csv.DictReader(SOURCE.open(encoding='utf-8-sig')))
    weeks = []
    for row in rows:
        week_number = int(re.search(r'\d+', row['周次']).group())
        week = next((item for item in weeks if item['week'] == week_number), None)
        if week is None:
            week = {'week': week_number, 'week_theme': row['周主题'].strip(), 'date_range': {'start': row['日期'], 'end': row['日期']}, 'sessions': []}
            weeks.append(week)
        week['date_range']['start'] = min(week['date_range']['start'], row['日期'])
        week['date_range']['end'] = max(week['date_range']['end'], row['日期'])
        if '停课' not in row['课程主题']:
            week['week_theme'] = row['周主题'].strip()
        session = {
            'session': row['课次'] if row['课次'] == '+' else int(row['课次']),
            'date': row['日期'],
            'weekday': row['星期'],
            'title': row['课程主题'].strip(),
            'method': row['教学方式'].strip(),
            'teaching_content': split_points(row['教学内容']),
            'deliverables_or_homework': parse_homework(row['作业／阶段成果']),
        }
        if row['备注'].startswith('阶段成果'):
            session['milestone'] = int(re.search(r'\d+', row['备注']).group())
        if row['课次'] == '+':
            session['auxiliary'] = True
        if '停课' in row['课程主题']:
            session.update({'holiday_conflict': True, 'holiday_note': row['课程主题'].strip(), 'cancelled': True})
        module = parse_content_module(row['内容模块'])
        if module:
            session['content_modules'] = [module]
        week['sessions'].append(session)

    data = {
        'course': {
            'name_zh': '内容与策展', 'name_en': 'CONTENT & CURATING', 'term': '2026 秋季学期',
            'audience': '视觉传播专业三年级', 'prerequisite': '视觉传播二年级基础课程', 'duration_weeks': 8,
            'session_count': 16, 'class_time': '第 1–5 周周一、周四下午；第 3–4 周另设周二加课；第 6–8 周周一、周三、周四下午',
            'overall_period': {'start': '2026-09-07', 'end': '2026-11-19'},
            'phases': [
                {'name': '第一阶段', 'weeks': '第 1–5 周', 'start': '2026-09-07', 'end': '2026-10-08'},
                {'name': '第二阶段', 'weeks': '第 6–8 周', 'start': '2026-11-02', 'end': '2026-11-19'},
            ],
            'final_output': '1 个展览', 'assessment_mode': '过程性考核＋期末综合汇报',
        },
        'schedule': weeks,
        'assessment': [
            {'item': '出勤与课堂参与', 'timing': '第 1–8 周', 'weight_percent': 10},
            {'item': '内容数据库与展览内容网站原型', 'timing': '第 2 周提交（阶段成果①）', 'weight_percent': 15},
            {'item': '正式策展提案', 'timing': '第 4 周提交（阶段成果②）', 'weight_percent': 15},
            {'item': '中期整合提案', 'timing': '第 5 周汇报（阶段成果③）', 'weight_percent': 15},
            {'item': '视觉系统方案', 'timing': '第 6 周提交（阶段成果④）', 'weight_percent': 15},
            {'item': '制作测试与安装排期', 'timing': '第 7 周确认（阶段成果⑤）', 'weight_percent': 15},
            {'item': '期末综合汇报', 'timing': '第 8 周汇报', 'weight_percent': 30},
        ],
        'schedule_adjustment': {'reason': '国庆假期与课程加课安排', 'affected_sessions': [9], 'suggestion': '10/5 国庆假期停课；9/22、11/4、11/11、11/18 为加课，课次以“+”标注。实际安排以教务通知为准。', 'status': '实际安排以教务通知为准'},
        'source': {'page_title': '内容与策展_课程进度表 2.1', 'source_file': 'outputs/01a009c5/内容与策展_课程进度表 2.1.csv', 'updated_on': '2026-08-18'},
    }
    TARGET.write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')


if __name__ == '__main__':
    main()
