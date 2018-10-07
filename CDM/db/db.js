const Datastore = require('nedb-promise');
const fs = require("fs");
const path = require("path");
const db_backup = new Datastore({ filename: 'backup', autoload: true });
const db_plan = new Datastore({ filename: 'plan', autoload: true });
const db_restore = new Datastore({ filename: 'restore', autoload: true });

// init();
remove();
// query();

async function init() {
    await Promise.all(
        fs.readdirSync('../img').map((file) => db_backup.insert({ name: file }))
    )
}

async function query() {
    let docs1 = await db_backup.find({})
    let docs2 = await db_plan.find({})

    console.log('backup');
    console.log(docs1);

    console.log('plan');
    console.log(docs2);
}
async function remove() {
    await db_plan.remove({}, { multi: true });
    await db_backup.remove({}, { multi: true });
    await db_restore.remove({}, { multi: true });
}