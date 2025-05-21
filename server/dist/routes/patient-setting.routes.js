"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const patientSettingController = __importStar(require("../controllers/patient-setting.controller"));
const router = (0, express_1.Router)();
// 用户个人资料API
router.get('/profile', auth_1.authenticate, patientSettingController.getPatientProfile);
router.put('/profile', auth_1.authenticate, patientSettingController.updateProfile);
router.post('/change-password', auth_1.authenticate, patientSettingController.changePassword);
// 过敏信息API
router.get('/allergies', auth_1.authenticate, patientSettingController.getAllergies);
router.post('/allergies', auth_1.authenticate, patientSettingController.addAllergy);
router.put('/allergies/:id', auth_1.authenticate, patientSettingController.updateAllergy);
router.delete('/allergies/:id', auth_1.authenticate, patientSettingController.deleteAllergy);
// 紧急联系人API
router.get('/emergency-contacts', auth_1.authenticate, patientSettingController.getEmergencyContacts);
router.post('/emergency-contacts', auth_1.authenticate, patientSettingController.addEmergencyContact);
router.put('/emergency-contacts/:id', auth_1.authenticate, patientSettingController.updateEmergencyContact);
router.delete('/emergency-contacts/:id', auth_1.authenticate, patientSettingController.deleteEmergencyContact);
exports.default = router;
//# sourceMappingURL=patient-setting.routes.js.map