#!/usr/bin/env python3
"""Contract checks for the discovery-integrity audit."""

from audit_discovery_integrity import inspect_html, summarise


def main() -> int:
    good_html = """
    <html><head>
      <title>Churn Is Dead</title>
      <link rel="canonical" href="https://churnisdead.com/playbook">
      <meta name="robots" content="index,follow">
      <meta name="description" content="Useful Customer Success playbooks.">
      <script type="application/ld+json">{}</script>
    </head></html>
    """
    good = inspect_html(
        "https://churnisdead.com/playbook", 200, "https://churnisdead.com/playbook", good_html
    )
    assert good["canonical_ok"] is True
    assert good["redirected"] is False
    assert good["noindex"] is False
    assert good["jsonld"] == 1
    assert good["desc_len"] > 0
    assert good["semantic_dead"] is False

    article = inspect_html(
        "https://churnisdead.com/newsletter/example",
        200,
        "https://churnisdead.com/newsletter/example",
        good_html.replace("</head>", '<script id="ci-newsletter" type="application/json">{}</script></head>'),
    )
    assert article["semantic_dead"] is False

    semantic_dead = inspect_html(
        "https://churnisdead.com/newsletter/missing",
        200,
        "https://churnisdead.com/newsletter/missing",
        good_html.replace(
            "https://churnisdead.com/playbook",
            "https://churnisdead.com/newsletter/missing",
        ),
    )
    assert semantic_dead["semantic_dead"] is True

    broken = inspect_html(
        "https://churnisdead.com/newsletters",
        200,
        "https://churnisdead.com/archive",
        '<meta name="robots" content="noindex">',
    )
    groups, blockers = summarise([good, broken, semantic_dead])
    assert len(groups["redirected"]) == 1
    assert len(groups["canonical mismatch"]) == 1
    assert len(groups["noindex"]) == 1
    assert len(groups["no meta description"]) == 1
    assert len(groups["semantic dead page"]) == 1
    assert blockers == 5
    print("discovery integrity audit contract passed")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
