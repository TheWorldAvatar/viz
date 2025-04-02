export type Dictionary = {
    action: {
        add:string;
        backTo:string;
        export:string;
        overview:string;
        viewTasks:string;
        generateReport:string;
        date:string;
    }
    nav: {
        caption: {
            map: string;
            dashboard: string;
            registry: string;
            generalReg: string;
            help: string;
        },
        title: {
            map: string;
            dashboard: string;
            registry: string;
            help: string;
            pending: string;
            active: string;
            archive: string;
        },
        tooltip: {
            home: string;
            map: string;
            dashboard: string;
            registry: string;
            help: string;
        }
    };
};
