-- 校准系统预设选题的空间归属、色彩和排序
UPDATE topics SET room_id = 'room1', color_token = 'var(--home-spot-03)', sort_order = 1 WHERE normalized_label = '客厅';
UPDATE topics SET room_id = 'room1', color_token = 'var(--home-spot-15)', sort_order = 15 WHERE normalized_label = '码头';
UPDATE topics SET room_id = 'room2', color_token = 'var(--home-spot-02)', sort_order = 2 WHERE normalized_label = '橱窗';
UPDATE topics SET room_id = 'room2', color_token = 'var(--home-spot-14)', sort_order = 3 WHERE normalized_label = '隧道';
UPDATE topics SET room_id = 'room3', color_token = 'var(--home-spot-01)', sort_order = 4 WHERE normalized_label = '桌面';
UPDATE topics SET room_id = 'room3', color_token = 'var(--home-spot-05)', sort_order = 6 WHERE normalized_label = '蓄水池';
UPDATE topics SET room_id = 'room4', color_token = 'var(--home-spot-04)', sort_order = 5 WHERE normalized_label = '暗房';
UPDATE topics SET room_id = 'room4', color_token = 'var(--home-spot-16)', sort_order = 16 WHERE normalized_label = '影院';
UPDATE topics SET room_id = 'room5', color_token = 'var(--home-spot-17)', sort_order = 17 WHERE normalized_label = '工厂';
UPDATE topics SET room_id = 'room6', color_token = 'var(--home-spot-07)', sort_order = 7 WHERE normalized_label = '田';
UPDATE topics SET room_id = 'room7', color_token = 'var(--home-spot-06)', sort_order = 8 WHERE normalized_label = '黄页';
UPDATE topics SET room_id = 'room8', color_token = 'var(--home-spot-08)', sort_order = 9 WHERE normalized_label = '晒场';
UPDATE topics SET room_id = 'room9', color_token = 'var(--home-spot-09)', sort_order = 10 WHERE normalized_label = '阳台';
UPDATE topics SET room_id = 'room10', color_token = 'var(--home-spot-10)', sort_order = 11 WHERE normalized_label = '宴席';
UPDATE topics SET room_id = 'room11', color_token = 'var(--home-spot-11)', sort_order = 12 WHERE normalized_label = '谷仓';
UPDATE topics SET room_id = 'room11', color_token = 'var(--home-spot-12)', sort_order = 13 WHERE normalized_label = '楼梯间';
UPDATE topics SET room_id = 'room12', color_token = 'var(--home-spot-13)', sort_order = 14 WHERE normalized_label = '监控室';
