import json
import subprocess

# channels.json ഫയലിൽ നിന്ന് യൂട്യൂബ് ലിങ്കുകൾ വായിക്കുന്നു
with open('channels.json', 'r') as f:
    channels = json.load(f)

streams = {}

for name, url in channels.items():
    try:
        # yt-dlp വഴി 1080p m3u8 ലിങ്ക് എടുക്കുന്നു
        cmd = ['yt-dlp', '-f', 'best', '-g', url]
        m3u8_url = subprocess.check_output(cmd, text=True).strip()
        streams[name] = m3u8_url
        print(f"Successfully updated: {name}")
    except Exception as e:
        print(f"Error fetching {name}: {e}")

# പുതിയ m3u8 ലിങ്കുകൾ streams.json ഫയലിലേക്ക് സേവ് ചെയ്യുന്നു
with open('streams.json', 'w') as f:
    json.dump(streams, f, indent=2)
