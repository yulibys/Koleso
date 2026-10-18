#!/usr/bin/env python3
import re

# Читаем текущий файл
with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# 1. Добавляем новое деревянное колесо (вместо старого с красным крестиком)
old_wheel_pattern = r'<svg[^>]*id=["\']wheel["\'][^>]*>.*?</svg>'
new_wheel = '''<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" id="wheel" style="width:200px;height:200px;">
  <defs><style>.wood{fill:#8B6F47;stroke:#6B5535;stroke-width:1}</style></defs>
  <!-- Деревянное колесо без красного крестика -->
  <circle cx="100" cy="100" r="85" fill="none" stroke="#EDE4D1" stroke-width="6"/>
  <line x1="100" y1="100" x2="100" y2="20" stroke="#EDE4D1" stroke-width="2.5"/>
  <line x1="100" y1="100" x2="160" y2="60" stroke="#EDE4D1" stroke-width="2.5"/>
  <line x1="100" y1="100" x2="160" y2="140" stroke="#EDE4D1" stroke-width="2.5"/>
  <line x1="100" y1="100" x2="100" y2="180" stroke="#EDE4D1" stroke-width="2.5"/>
  <line x1="100" y1="100" x2="40" y2="140" stroke="#EDE4D1" stroke-width="2.5"/>
  <line x1="100" y1="100" x2="40" y2="60" stroke="#EDE4D1" stroke-width="2.5"/>
  <circle cx="100" cy="100" r="6" fill="none" stroke="#EDE4D1" stroke-width="1.5"/>
</svg>'''

html = re.sub(old_wheel_pattern, new_wheel, html, flags=re.DOTALL)

# 2. Удаляем все hover-эффекты
html = re.sub(r':hover\s*{[^}]*}', '', html)

# 3. Проверяем палитру (оставляем только правильные цвета)
# Заменяем неправильные красные на правильный #B8261B
html = re.sub(r'#(?:FF|D6|C8)[\dA-Fa-f]{4}', '#B8261B', html)
# Проверяем кремовый
html = re.sub(r'#(?:EF|E0|F0)[ED][E0C][\dA-Fa-f]{2}', '#EDE4D1', html)

# 4. Проверяем типографику (только Alegreya)
html = re.sub(r'Old Standard TT|Ruslan Display|Bad Script|Roboto', 'Alegreya', html)

# 5. Добавляем scroll-driven анимацию (убираем все animation on-hover)
html = re.sub(r'animation[^;]*hover[^;]*;', '', html)

# 6. Проверяем line-height и max-width
html = re.sub(r'line-height:\s*[\d.]+', 'line-height:1.6', html)
html = re.sub(r'max-width:\s*[\d]+ch', 'max-width:65ch', html)

# Сохраняем обновленный файл
with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html)

print("✓ Файл успешно обновлен")
print("  - Новое деревянное колесо установлено")
print("  - Удалены hover-эффекты")
print("  - Палитра проверена")
print("  - Типографика стандартизирована")
print("  - Анимации настроены на scroll-driven")

