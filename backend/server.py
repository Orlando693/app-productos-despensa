from __future__ import annotations

import json
import sqlite3
from datetime import datetime, timezone
from http import HTTPStatus
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import urlparse

HOST = "127.0.0.1"
PORT = 8000
DB_PATH = Path(__file__).with_name("despensa.db")


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")


def connect() -> sqlite3.Connection:
    connection = sqlite3.connect(DB_PATH)
    connection.row_factory = sqlite3.Row
    connection.execute("PRAGMA foreign_keys = ON")
    return connection


def init_db() -> None:
    with connect() as db:
        db.executescript(
            """
            CREATE TABLE IF NOT EXISTS shopping_lists (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                description TEXT NOT NULL DEFAULT '',
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL
            );

            CREATE TABLE IF NOT EXISTS products (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                list_id INTEGER NOT NULL,
                name TEXT NOT NULL,
                purchased INTEGER NOT NULL DEFAULT 0,
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL,
                FOREIGN KEY (list_id) REFERENCES shopping_lists(id) ON DELETE CASCADE
            );

            CREATE INDEX IF NOT EXISTS idx_products_list_id ON products(list_id);
            """
        )

        count = db.execute("SELECT COUNT(*) FROM shopping_lists").fetchone()[0]
        if count == 0:
            seed(db)


def seed(db: sqlite3.Connection) -> None:
    now = now_iso()
    supermarket = db.execute(
        "INSERT INTO shopping_lists(name, description, created_at, updated_at) VALUES (?, ?, ?, ?)",
        ("Supermercado", "Compras semanales para la casa", now, now),
    ).lastrowid
    market = db.execute(
        "INSERT INTO shopping_lists(name, description, created_at, updated_at) VALUES (?, ?, ?, ?)",
        ("Mercado", "Frutas y verduras", now, now),
    ).lastrowid

    db.executemany(
        "INSERT INTO products(list_id, name, purchased, created_at, updated_at) VALUES (?, ?, ?, ?, ?)",
        [
            (supermarket, "Leche", 0, now, now),
            (supermarket, "Pan", 0, now, now),
            (supermarket, "Huevos", 1, now, now),
            (market, "Tomate", 0, now, now),
            (market, "Manzanas", 0, now, now),
        ],
    )


def product_json(row: sqlite3.Row) -> dict:
    return {
        "id": row["id"],
        "name": row["name"],
        "purchased": bool(row["purchased"]),
        "updatedAt": row["updated_at"],
    }


def list_json(db: sqlite3.Connection, row: sqlite3.Row) -> dict:
    products = db.execute(
        "SELECT id, name, purchased, updated_at FROM products WHERE list_id = ? ORDER BY id",
        (row["id"],),
    ).fetchall()
    return {
        "id": row["id"],
        "name": row["name"],
        "description": row["description"],
        "updatedAt": row["updated_at"],
        "products": [product_json(product) for product in products],
    }


def all_lists(db: sqlite3.Connection) -> list[dict]:
    rows = db.execute(
        "SELECT id, name, description, updated_at FROM shopping_lists ORDER BY updated_at DESC, id DESC"
    ).fetchall()
    return [list_json(db, row) for row in rows]


class ApiHandler(BaseHTTPRequestHandler):
    server_version = "DespensaApi/1.0"

    def log_message(self, fmt: str, *args) -> None:
        print(f"[api] {self.address_string()} - {fmt % args}")

    def end_headers(self) -> None:
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE, OPTIONS")
        super().end_headers()

    def do_OPTIONS(self) -> None:
        self.send_response(HTTPStatus.NO_CONTENT)
        self.end_headers()

    def do_GET(self) -> None:
        path = urlparse(self.path).path
        if path == "/api/health":
            self.respond({"ok": True})
            return
        if path == "/api/lists":
            with connect() as db:
                self.respond(all_lists(db))
            return
        self.respond({"error": "Not found"}, HTTPStatus.NOT_FOUND)

    def do_POST(self) -> None:
        path = urlparse(self.path).path
        body = self.read_json()
        if body is None:
            return

        if path == "/api/lists":
            name = str(body.get("name", "")).strip()
            description = str(body.get("description", "")).strip()
            if not name:
                self.respond({"error": "name is required"}, HTTPStatus.BAD_REQUEST)
                return

            now = now_iso()
            with connect() as db:
                list_id = db.execute(
                    "INSERT INTO shopping_lists(name, description, created_at, updated_at) VALUES (?, ?, ?, ?)",
                    (name, description, now, now),
                ).lastrowid
                row = db.execute(
                    "SELECT id, name, description, updated_at FROM shopping_lists WHERE id = ?",
                    (list_id,),
                ).fetchone()
                self.respond(list_json(db, row), HTTPStatus.CREATED)
            return

        parts = [part for part in path.split("/") if part]
        if len(parts) == 4 and parts[:2] == ["api", "lists"] and parts[3] == "products":
            self.create_product(int(parts[2]), body)
            return

        if len(parts) == 5 and parts[:2] == ["api", "lists"] and parts[3:] == ["products", "bulk"]:
            self.create_products_bulk(int(parts[2]), body)
            return

        self.respond({"error": "Not found"}, HTTPStatus.NOT_FOUND)

    def create_product(self, list_id: int, body: dict) -> None:
        name = str(body.get("name", "")).strip()
        if not name:
            self.respond({"error": "name is required"}, HTTPStatus.BAD_REQUEST)
            return

        now = now_iso()
        with connect() as db:
            if not db.execute("SELECT 1 FROM shopping_lists WHERE id = ?", (list_id,)).fetchone():
                self.respond({"error": "list not found"}, HTTPStatus.NOT_FOUND)
                return
            product_id = db.execute(
                "INSERT INTO products(list_id, name, purchased, created_at, updated_at) VALUES (?, ?, 0, ?, ?)",
                (list_id, name, now, now),
            ).lastrowid
            db.execute("UPDATE shopping_lists SET updated_at = ? WHERE id = ?", (now, list_id))
            row = db.execute(
                "SELECT id, name, purchased, updated_at FROM products WHERE id = ?", (product_id,)
            ).fetchone()
            self.respond(product_json(row), HTTPStatus.CREATED)

    def create_products_bulk(self, list_id: int, body: dict) -> None:
        names = [str(name).strip() for name in body.get("names", []) if str(name).strip()]
        if not names:
            self.respond({"error": "names is required"}, HTTPStatus.BAD_REQUEST)
            return

        now = now_iso()
        with connect() as db:
            if not db.execute("SELECT 1 FROM shopping_lists WHERE id = ?", (list_id,)).fetchone():
                self.respond({"error": "list not found"}, HTTPStatus.NOT_FOUND)
                return
            ids = []
            for name in names:
                ids.append(
                    db.execute(
                        "INSERT INTO products(list_id, name, purchased, created_at, updated_at) VALUES (?, ?, 0, ?, ?)",
                        (list_id, name, now, now),
                    ).lastrowid
                )
            db.execute("UPDATE shopping_lists SET updated_at = ? WHERE id = ?", (now, list_id))
            placeholders = ",".join("?" for _ in ids)
            rows = db.execute(
                f"SELECT id, name, purchased, updated_at FROM products WHERE id IN ({placeholders}) ORDER BY id",
                ids,
            ).fetchall()
            self.respond([product_json(row) for row in rows], HTTPStatus.CREATED)

    def do_PATCH(self) -> None:
        path = urlparse(self.path).path
        body = self.read_json()
        if body is None:
            return

        parts = [part for part in path.split("/") if part]
        if len(parts) != 3 or parts[:2] != ["api", "products"]:
            self.respond({"error": "Not found"}, HTTPStatus.NOT_FOUND)
            return

        product_id = int(parts[2])
        with connect() as db:
            current = db.execute(
                "SELECT id, list_id, name, purchased, updated_at FROM products WHERE id = ?", (product_id,)
            ).fetchone()
            if current is None:
                self.respond({"error": "product not found"}, HTTPStatus.NOT_FOUND)
                return

            name = str(body.get("name", current["name"])).strip()
            purchased = 1 if bool(body.get("purchased", bool(current["purchased"]))) else 0
            if not name:
                self.respond({"error": "name cannot be empty"}, HTTPStatus.BAD_REQUEST)
                return

            now = now_iso()
            db.execute(
                "UPDATE products SET name = ?, purchased = ?, updated_at = ? WHERE id = ?",
                (name, purchased, now, product_id),
            )
            db.execute("UPDATE shopping_lists SET updated_at = ? WHERE id = ?", (now, current["list_id"]))
            row = db.execute(
                "SELECT id, name, purchased, updated_at FROM products WHERE id = ?", (product_id,)
            ).fetchone()
            self.respond(product_json(row))

    def do_DELETE(self) -> None:
        path = urlparse(self.path).path
        parts = [part for part in path.split("/") if part]
        if len(parts) != 3 or parts[:2] != ["api", "products"]:
            self.respond({"error": "Not found"}, HTTPStatus.NOT_FOUND)
            return

        product_id = int(parts[2])
        with connect() as db:
            row = db.execute("SELECT list_id FROM products WHERE id = ?", (product_id,)).fetchone()
            if row is None:
                self.respond({"error": "product not found"}, HTTPStatus.NOT_FOUND)
                return
            db.execute("DELETE FROM products WHERE id = ?", (product_id,))
            db.execute("UPDATE shopping_lists SET updated_at = ? WHERE id = ?", (now_iso(), row["list_id"]))
        self.send_response(HTTPStatus.NO_CONTENT)
        self.end_headers()

    def read_json(self) -> dict | None:
        try:
            length = int(self.headers.get("Content-Length", "0"))
            raw = self.rfile.read(length) if length else b"{}"
            return json.loads(raw.decode("utf-8"))
        except (ValueError, json.JSONDecodeError):
            self.respond({"error": "invalid JSON"}, HTTPStatus.BAD_REQUEST)
            return None

    def respond(self, payload, status: HTTPStatus = HTTPStatus.OK) -> None:
        raw = json.dumps(payload, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(raw)))
        self.end_headers()
        self.wfile.write(raw)


def main() -> None:
    init_db()
    server = ThreadingHTTPServer((HOST, PORT), ApiHandler)
    print(f"Despensa API running on http://{HOST}:{PORT}")
    print(f"SQLite database: {DB_PATH}")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nStopping API...")
    finally:
        server.server_close()


if __name__ == "__main__":
    main()
