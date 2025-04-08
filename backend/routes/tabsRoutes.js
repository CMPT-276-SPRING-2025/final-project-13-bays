const express = require("express");
const { saveTabs, getTabs } = require("../controllers/tabsController");
const router = express.Router();

router.post("/projects/:projectId/tabs", saveTabs);
router.get("/projects/:projectId/tabs", getTabs);

module.exports = router;