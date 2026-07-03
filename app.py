import json
import os
import re
import sys

try:
    import requests
except ImportError:
    requests = None

try:
    import webview
except ImportError:
    webview = None

BASE_DIR = os.path.dirname(os.path.abspath(__file__))


def resource_path(relative_path: str) -> str:
    if getattr(sys, '_MEIPASS', None):
        return os.path.join(sys._MEIPASS, relative_path)
    return os.path.join(BASE_DIR, relative_path)

DATA_PATH = resource_path('public_data.json')
CONFIG_PATH = resource_path('config.json')
HTML_PATH = resource_path('index.html')
AUTOBOOM_PATH = resource_path('data/autoboom_info.json')

PLATE_PATTERNS = [
    (r'^(\d{2})(\d{3})(\d{2})$', '{0}-{1}-{2}'),
    (r'^(\d{3})(\d{2})(\d{3})$', '{0}-{1}-{2}')
]


def normalize_plate(value: str) -> str:
    return re.sub(r'[^0-9]', '', value or '')


def format_plate(value: str) -> str:
    digits = normalize_plate(value)
    for pattern, template in PLATE_PATTERNS:
        match = re.match(pattern, digits)
        if match:
            return template.format(*match.groups())
    return value.strip().upper()


def load_json(path: str, default=None):
    try:
        with open(path, 'r', encoding='utf-8') as handle:
            return json.load(handle)
    except FileNotFoundError:
        return default
    except json.JSONDecodeError:
        return default


class Api:
    def __init__(self):
        self.data = load_json(DATA_PATH, {}) or {}
        self.config = load_json(CONFIG_PATH, {}) or {}
        self.autoboom = load_json(AUTOBOOM_PATH, {}) or {}
        self.api_endpoint = self.config.get('apiEndpoint', '').strip()
        self.api_key = self.config.get('apiKey', '').strip()

    def _fetch_remote(self, plate: str):
        if not self.api_endpoint:
            return None
        if requests is None:
            return {
                'error': 'requests library is not installed. Install requirements and restart.'
            }

        headers = {'Content-Type': 'application/json'}
        if self.api_key:
            headers['Authorization'] = f'Bearer {self.api_key}'

        payload = {'plate': plate}

        try:
            response = requests.post(self.api_endpoint, json=payload, headers=headers, timeout=10)
            response.raise_for_status()
            return response.json()
        except Exception as exc:
            return {'error': str(exc)}

    def lookup_plate(self, plate: str):
        formatted_plate = format_plate(plate)
        if not formatted_plate:
            return {'error': 'Please enter a valid license plate.'}

        if self.api_endpoint:
            remote_result = self._fetch_remote(formatted_plate)
            if remote_result:
                return remote_result

        result = self.data.get(formatted_plate)
        if result:
            return {
                'plate': formatted_plate,
                'manufacturer': result.get('manufacturer', 'N/A'),
                'model': result.get('model', 'N/A'),
                'year': result.get('year', 'N/A'),
                'fuel': result.get('fuel', 'N/A'),
                'owner': result.get('owner', 'Publically available'),
                'registration': result.get('registration', 'Public'),
                'status': result.get('status', 'Active'),
                'statusColor': result.get('statusColor', '#22d3ee')
            }

        return {
            'plate': formatted_plate,
            'manufacturer': 'Unknown',
            'model': 'Unknown',
            'year': 'Unknown',
            'fuel': 'Unknown',
            'owner': 'Not available',
            'registration': 'Not available',
            'status': 'Not found',
            'statusColor': '#f97316'
        }

    # Expose static Autoboom excerpt data for the frontend
    def get_autoboom_info(self):
        return self.autoboom or {'error': 'Autoboom info not available'}


def start_app():
    if webview is None:
        raise RuntimeError('pywebview is not installed. Run: pip install pywebview requests')

    api = Api()
    webview.create_window(
        'IL Plate Checker',
        HTML_PATH,
        js_api=api,
        width=1280,
        height=760,
        fullscreen=True,
        resizable=True,
        min_size=(800, 520)
    )
    webview.start(debug=False, http_server=True)


if __name__ == '__main__':
    start_app()
