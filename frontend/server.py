import http.server
import socketserver
import os

PORT = 3000

class CleanURLHandler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        # Strip query string for path resolution
        path = self.path.split('?')[0]
        
        # Default root
        if path == '/' or path == '':
            self.path = '/index.html'
            return super().do_GET()

        # Check if exact file exists
        full_path = self.translate_path(self.path)
        if os.path.isfile(full_path):
            return super().do_GET()

        # Try adding .html extension if missing
        if os.path.isfile(full_path + '.html'):
            self.path = self.path + '.html'
            return super().do_GET()

        # Map legacy names to new filenames
        legacy_map = {
            '/upload_processing': '/upload.html',
            '/upload_processing.html': '/upload.html',
            '/meeting_analysis': '/transcript.html',
            '/meeting_analysis.html': '/transcript.html',
            '/ai_assistant': '/ai-assistant.html',
            '/ai_assistant.html': '/ai-assistant.html',
            '/landing_page': '/index.html',
            '/landing_page.html': '/index.html',
            '/upload': '/upload.html',
            '/transcript': '/transcript.html',
            '/ai-assistant': '/ai-assistant.html',
            '/login': '/login.html',
            '/signup': '/signup.html'
        }

        if path in legacy_map:
            self.path = legacy_map[path]
            return super().do_GET()

        return super().do_GET()

if __name__ == '__main__':
    web_dir = os.path.dirname(os.path.abspath(__file__))
    os.chdir(web_dir)
    
    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer(("0.0.0.0", PORT), CleanURLHandler) as httpd:
        print(f"MeetMind server running on http://localhost:{PORT}")
        httpd.serve_forever()
