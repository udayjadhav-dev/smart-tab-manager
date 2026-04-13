import { useState, useEffect } from "react"

export default function Popup() {
  const [groupedTabs, setGroupedTabs] = useState({})
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadTabs()
  }, [])

  async function loadTabs() {
    const tabs = await chrome.tabs.query({ currentWindow: true })
    const data = await chrome.storage.local.get("tabCategories")
    const cats = data.tabCategories || {}
    const groups = {}
    tabs.forEach(tab => {
      const category = cats[tab.id] || "Other"
      if (!groups[category]) groups[category] = []
      groups[category].push(tab)
    })
    setGroupedTabs(groups)
  }

  async function groupAllTabs() {
    setLoading(true)
    const colorMap = {
      Work: "blue", Shopping: "green", YouTube: "red",
      News: "orange", Social: "purple", Other: "grey"
    }
    for (const [category, tabs] of Object.entries(groupedTabs)) {
      if (tabs.length === 0) continue
      const tabIds = tabs.map(t => t.id)
      const groupId = await chrome.tabs.group({ tabIds })
      await chrome.tabGroups.update(groupId, {
        title: category,
        color: colorMap[category] || "grey",
        collapsed: false
      })
    }
    setLoading(false)
    window.close()
  }

  return (
    <div style={{ width: "320px", padding: "16px", fontFamily: "sans-serif" }}>
      <h2 style={{ margin: "0 0 4px", fontSize: "16px" }}>Smart Tab Manager</h2>
      <p style={{ margin: "0 0 12px", fontSize: "12px", color: "#666" }}>
        {Object.values(groupedTabs).flat().length} tabs detected
      </p>

      {Object.entries(groupedTabs).map(([category, tabs]) => (
        <div key={category} style={{ marginBottom: "12px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
            <span style={{ fontWeight: "500", fontSize: "13px" }}>{category}</span>
            <span style={{ fontSize: "12px", color: "#888" }}>{tabs.length} tabs</span>
          </div>
          {tabs.map(tab => (
            <div key={tab.id} style={{
              display: "flex", alignItems: "center", gap: "6px",
              padding: "4px 6px", borderRadius: "4px", cursor: "pointer",
              fontSize: "12px", color: "#333"
            }}
              onClick={() => chrome.tabs.update(tab.id, { active: true })}>
              <img src={tab.favIconUrl} width="12" height="12" alt="" />
              <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {tab.title}
              </span>
            </div>
          ))}
        </div>
      ))}

      <button onClick={groupAllTabs} disabled={loading} style={{
        width: "100%", padding: "8px", backgroundColor: "#4F46E5",
        color: "white", border: "none", borderRadius: "6px",
        cursor: "pointer", fontSize: "13px", marginTop: "8px"
      }}>
        {loading ? "Grouping..." : "Group All Tabs"}
      </button>
    </div>
  )
}