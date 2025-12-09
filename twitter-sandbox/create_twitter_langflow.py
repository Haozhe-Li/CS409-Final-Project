# Copy and paste this into langflow for creating tools

from langflow.custom.custom_component.component import Component
from langflow.io import MessageTextInput, Output, DropdownInput
from langflow.schema.data import Data
import requests
import json


class TwitterSandboxTool(Component):
    display_name = "Twitter Sandbox Tool"
    description = "Use Bearer JWT (user-provided) to call Next.js APIs: create, delete, list posts."
    documentation: str = "https://docs.langflow.org/components-custom-components"
    icon = "tool"
    name = "TwitterSandboxTool"

    inputs = [
        MessageTextInput(
            name="base_url",
            display_name="Base URL",
            info="Your Next.js domain",
            value="https://twitter-sandbox-nine.vercel.app",
            tool_mode=False,
        ),
        MessageTextInput(
            name="jwt",
            display_name="Bearer JWT",
            info="Paste your short-lived access token (Authorization: Bearer <JWT>)",
            value="",
            tool_mode=False,
        ),
        DropdownInput(
            name="action",
            display_name="Action",
            options=["create", "delete", "list"],
            value="list",
            tool_mode=True,
            info="Agent chooses: create/delete/list",
        ),
        MessageTextInput(
            name="content",
            display_name="Content",
            info="Post content (required for create)",
            value="",
            tool_mode=True,
        ),
        MessageTextInput(
            name="post_id",
            display_name="Post ID",
            info="ID to delete (required for delete)",
            value="",
            tool_mode=True,
        ),
        MessageTextInput(
            name="limit",
            display_name="List Limit",
            info="Number of posts to list",
            value="10",
            tool_mode=True,
        ),
        MessageTextInput(
            name="cursor",
            display_name="List Cursor",
            info="ISO timestamp cursor for pagination",
            value="",
            tool_mode=True,
        ),
    ]

    outputs = [
        Output(display_name="Output", name="output", method="build_output"),
    ]

    def _headers(self, json_content=True, include_auth=True):
        headers = {}
        if json_content:
            headers["Content-Type"] = "application/json"
        if include_auth:
            jwt = (self.jwt or "").strip()
            if jwt:
                headers["Authorization"] = f"Bearer {jwt}"
        return headers

    def _safe_json(self, res: requests.Response):
        try:
            return res.json()
        except Exception:
            return {"text": res.text}

    def _create_post(self):
        content = (self.content or "").strip()
        if not content:
            return {"error": "content is required for create"}
        url = f"{self.base_url.rstrip('/')}/api/posts"
        try:
            res = requests.post(
                url,
                headers=self._headers(json_content=True, include_auth=True),
                data=json.dumps({"content": content}),
                timeout=20,
            )
            return {"status_code": res.status_code, "data": self._safe_json(res)}
        except Exception as e:
            return {"error": str(e)}

    def _delete_post(self):
        pid = (self.post_id or "").strip()
        if not pid:
            return {"error": "post_id is required for delete"}
        url = f"{self.base_url.rstrip('/')}/api/posts/{pid}"
        try:
            res = requests.delete(
                url,
                headers=self._headers(json_content=False, include_auth=True),
                timeout=20,
            )
            return {"status_code": res.status_code, "data": self._safe_json(res)}
        except Exception as e:
            return {"error": str(e)}

    def _list_posts(self):
        qs = []
        if (self.limit or "").strip():
            qs.append(f"limit={(self.limit or '').strip()}")
        if (self.cursor or "").strip():
            qs.append(f"cursor={(self.cursor or '').strip()}")
        url = f"{self.base_url.rstrip('/')}/api/posts" + (
            f"?{'&'.join(qs)}" if qs else ""
        )
        try:
            res = requests.get(
                url,
                headers=self._headers(json_content=False, include_auth=True),
                timeout=20,
            )
            return {"status_code": res.status_code, "data": self._safe_json(res)}
        except Exception as e:
            return {"error": str(e)}

    def build_output(self) -> Data:
        if self.action in ("create", "delete") and not (self.jwt or "").strip():
            result = {
                "error": "Bearer JWT is required. Paste your token in the component settings."
            }
        else:
            if self.action == "create":
                result = self._create_post()
            elif self.action == "delete":
                result = self._delete_post()
            elif self.action == "list":
                result = self._list_posts()
            else:
                result = {"error": f"unknown action: {self.action}"}

        data = Data(value=result)
        self.status = data
        return data
