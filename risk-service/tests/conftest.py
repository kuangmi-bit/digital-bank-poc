"""pytest  fixtures：临时规则文件、Mock ES 等."""
import tempfile
from pathlib import Path

import pytest


@pytest.fixture
def temp_rules_path():
    """可写的临时 rules.yaml，含 limit、frequency、blacklist."""
    c = """
version: "1.0.0"
rules:
  - name: limit_5k
    type: limit
    enabled: true
    priority: 1
    action: reject
    error_code: RKB003
    condition:
      max_amount: 5000
  - name: freq_2
    type: frequency
    enabled: true
    priority: 10
    action: reject
    error_code: RKB004
    condition:
      max_count: 2
      window: "1h"
  - name: bl
    type: blacklist
    enabled: true
    priority: 0
    action: reject
    error_code: RKB002
    condition:
      check_types: ["customer"]
"""
    with tempfile.NamedTemporaryFile(mode="w", suffix=".yaml", delete=False) as f:
        f.write(c)
        yield f.name
    Path(f.name).unlink(missing_ok=True)
