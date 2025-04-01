export type Dictionary = {
    navigation: {
        home: string;
        map: string;
        dashboard: string;
        help: string;
        registry: string;
        return: string;
    };
    common: {
        loading: string;
        noData: string;
        refresh: string;
        submit: string;
        cancel: string;
        delete: string;
        edit: string;
        view: string;
        search: string;
        export: string;
        add: string;
    };
    map: {
        location: string;
        mapStyle: string;
        resetCamera: string;
        placenames: string;
        terrain: string;
        fullscreen: string;
        selectScenario: string;
    };
    layers: {
        layerSelection: string;
        legend: string;
        information: string;
    };
    registry: {
        pending: string;
        active: string;
        archive: string;
        overview: string;
        viewTasks: string;
        backTo: string;
        generateReport: string;
        noResults: string;
        serviceDetails: string;
        scheduleDetails: string;
        addressDetails: string;
        contractDetails: string;
        serviceType: string;
        startDate: string;
        endDate: string;
        timeSlot: string;
        from: string;
        to: string;
        status: {
            available: string;
            unavailable: string;
            active: string;
            completed: string;
            cancelled: string;
            incomplete: string;
            rescinded: string;
            terminated: string;
            pendingDispatch: string;
            pendingExecution: string;
        };
    };
    modal: {
        actions: string;
        searchCriteria: string;
        completedService: string;
        dispatchResources: string;
        cancelService: string;
        reportIssue: string;
    };
    form: {
        addNew: string;
        findAddress: string;
        noAddressFound: string;
        selectLocation: string;
        serviceType: {
            singleService: string;
            regularService: string;
            alternateService: string;
        };
        serviceTypeDesc: {
            singleService: string;
            regularService: string;
            alternateService: string;
        };
        weekdays: {
            mon: string;
            tue: string;
            wed: string;
            thu: string;
            fri: string;
            sat: string;
            sun: string;
        };
        repeatEvery: string;
        week: string;
    };
    buttons: {
        dispatch: string;
        complete: string;
        cancel: string;
        report: string;
        publish: string;
        approve: string;
        rescind: string;
        terminate: string;
        showAll: string;
    };
    messages: {
        noMatchingFeature: string;
        matchingFeatures: string;
        timeSearchMessage: string;
        contractApproved: string;
        selectFeatureFromMap: string;
        multipleFeatures: string;
    };
    search: {
        searchPeriod: string;
    };
};
