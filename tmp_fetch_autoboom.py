import re
import urllib.request

url = 'https://autoboom.co.il/check-car?utm_source=google&utm_medium=cpc&utm_campaign=check-phone&utm_content=&utm_term=&gad_source=1&gad_campaignid=21198710632&gbraid=0AAAAABdtmxN6_ZdUxFQc2sRCImt8njsh9&gclid=CjwKCAjwu53SBhAhEiwAJzSLNpWgmXHfBz38YSuqnAdhKgkQ1MkI9zmoBk-AEJR7UyDduk6qch45pRoC2OMQAvD_BwE'
print('Fetching', url)
html = urllib.request.urlopen(url, timeout=30).read().decode('utf-8', errors='ignore')
print('LENGTH', len(html))
patterns = [r'fetch\(', r'XMLHttpRequest', r'/api/', r'check-car', r'axios', r'POST', r'get', r'xhr', r'license', r'checkCar', r'graphql']
for pat in patterns:
    if re.search(pat, html, re.IGNORECASE):
        print('FOUND', pat)
for m in re.findall(r'https?://[^"\'\s<>]+', html):
    if 'autoboom' in m and ('api' in m or 'check' in m or 'car' in m):
        print('URL', m)
for m in re.findall(r'"(\/[^"\']+)"', html):
    if 'api' in m or 'check' in m or 'car' in m:
        print('PATH', m)
        if len(m) > 120:
            break
