package org.openmrs.module.coreapps.page.controller.patientdashboard;

import java.util.Collections;
import java.util.List;

import org.openmrs.Location;
import org.openmrs.Patient;
import org.openmrs.Visit;
import org.openmrs.api.OrderService;
import org.openmrs.api.context.Context;
import org.openmrs.module.appframework.context.AppContextModel;
import org.openmrs.module.appframework.domain.AppDescriptor;
import org.openmrs.module.appframework.domain.Extension;
import org.openmrs.module.appframework.service.AppFrameworkService;
import org.openmrs.module.appui.UiSessionContext;
import org.openmrs.module.coreapps.CoreAppsConstants;
import org.openmrs.module.coreapps.CoreAppsProperties;
import org.openmrs.module.coreapps.contextmodel.PatientContextModel;
import org.openmrs.module.coreapps.contextmodel.VisitContextModel;
import org.openmrs.module.emrapi.adt.AdtService;
import org.openmrs.module.emrapi.event.ApplicationEventService;
import org.openmrs.module.emrapi.patient.PatientDomainWrapper;
import org.openmrs.module.emrapi.visit.VisitDomainWrapper;
import org.openmrs.ui.framework.annotation.InjectBeans;
import org.openmrs.ui.framework.annotation.SpringBean;
import org.openmrs.ui.framework.page.PageModel;
import org.openmrs.ui.framework.page.Redirect;
import org.springframework.web.bind.annotation.RequestParam;

public class ResultsTrendViewPageController {
    public Object controller(PageModel model, @RequestParam("patientId") Patient patient,
                    @RequestParam(required = false, value = "app") AppDescriptor app,
                    @RequestParam(value = "visitId", required = false) Visit visit,
                    @InjectBeans PatientDomainWrapper patientDomainWrapper,
                    @SpringBean("orderService") OrderService orderService,
                    @SpringBean("adtService") AdtService adtService,
                    @SpringBean("appFrameworkService") AppFrameworkService appFrameworkService,
                    @SpringBean("coreAppsProperties") CoreAppsProperties coreAppsProperties,
                    @SpringBean("applicationEventService") ApplicationEventService applicationEventService,
                    UiSessionContext sessionContext) {
    	
        model.addAttribute("patient", patient);
        model.addAttribute("app", app);
        
        if (!Context.hasPrivilege(CoreAppsConstants.PRIVILEGE_PATIENT_VISITS)) {
            return new Redirect("coreapps", "noAccess", "");
         }
         else if (patient.isVoided() || patient.isPersonVoided()) {
            return new Redirect("coreapps", "patientdashboard/deletedPatient", "patientId=" + patient.getId());
         }

         patientDomainWrapper.setPatient(patient);

         model.addAttribute("patient", patientDomainWrapper);
         model.addAttribute("selectedVisit", visit);

         Location visitLocation = null;
         try {
            visitLocation = adtService.getLocationThatSupportsVisits(sessionContext.getSessionLocation());
         } catch (IllegalArgumentException ex) {
            // location does not support visits
         }

         VisitDomainWrapper activeVisit = null;
         if (visitLocation != null) {
            activeVisit = adtService.getActiveVisit(patient, visitLocation);
         }
         model.addAttribute("activeVisit", activeVisit);

         List<Extension> encounterTemplateExtensions = appFrameworkService
               .getExtensionsForCurrentUser(CoreAppsConstants.ENCOUNTER_TEMPLATE_EXTENSION);
         model.addAttribute("encounterTemplateExtensions", encounterTemplateExtensions);


         AppContextModel contextModel = sessionContext.generateAppContextModel();
         contextModel.put("patient", new PatientContextModel(patient));
         contextModel.put("visit", activeVisit == null ? null : new VisitContextModel(activeVisit));
         model.addAttribute("appContextModel", contextModel);

         List<Extension> overallActions = appFrameworkService.getExtensionsForCurrentUser("patientDashboard.overallActions", contextModel);
         Collections.sort(overallActions);
         model.addAttribute("overallActions", overallActions);

         List<Extension> includeFragments = appFrameworkService.getExtensionsForCurrentUser("patientDashboard.includeFragments");
         Collections.sort(includeFragments);
         model.addAttribute("includeFragments", includeFragments);

         List<Extension> visitActions = appFrameworkService.getExtensionsForCurrentUser("patientDashboard.visitActions");

         Collections.sort(visitActions);
         model.addAttribute("visitActions", visitActions);
         model.addAttribute("patientTabs", appFrameworkService.getExtensionsForCurrentUser("patientDashboard.tabs"));

         model.addAttribute("dashboardUrl", coreAppsProperties.getDashboardUrl());

         model.addAttribute("encounterCount", coreAppsProperties.getPatientDashboardEncounterCount());

         applicationEventService.patientViewed(patient, sessionContext.getCurrentUser());

         model.addAttribute("userId", sessionContext.getCurrentUser().getUserId());

         return null;
    }
}