<%  	ui.decorateWith("appui", "standardEmrPage")
%>

<script type="text/javascript">
    var breadcrumbs = [
        { icon: "icon-home", link: '/' + OPENMRS_CONTEXT_PATH + '/index.htm' },
        { label: "${ ui.escapeJs(ui.encodeHtmlContent(ui.format(patient.patient))) }" ,
            link: '${ ui.urlBind("/" + contextPath + dashboardUrl, [ patientId: patient.patient.id ] ) }'}
    ];

    jq(function(){
        jq(".tabs").tabs();

        // make sure we reload the page if the location is changes; this custom event is emitted by by the location selector in the header
        jq(document).on('sessionLocationChanged', function() {
            window.location.reload();
        });
    });

    var patient = { id: ${ patient.id } };
    var encounterCount = ${ encounterCount };    // This variable will be reused in visits.gsp
</script>

${ ui.includeFragment("coreapps", "patientHeader", [ patient: patient.patient, activeVisit: activeVisit, appContextModel: appContextModel ]) }

    <div class="info-container column">
            <%
                    def configs = [:];
                    if(app.extensions[0].extensionParams.fragmentConfig != null){
                        configs = app.extensions[0].extensionParams.fragmentConfig;
                    }
                    configs << [ patient: patient, patientId: patient.id, app: app.id]
            %>
                    ${ ui.includeFragment("coreapps", "dashboardwidgets/dashboardWidget", configs)}
            
     </div>
</div>