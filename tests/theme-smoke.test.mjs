import assert from "node:assert/strict";
import {readFileSync} from "node:fs";

function read(path) {
    return readFileSync(path, "utf8");
}

const tagTemplate = read("tag.hbs");
const categoriesTemplate = read("categories.hbs");
const seriesTemplate = read("series.hbs");
const termCss = read("assets/css/site/term.css");
const routesYaml = read("routes.yaml");

assert.match(tagTemplate, /Featured posts/);
assert.match(tagTemplate, /Latest posts/);
assert.match(tagTemplate, /filter="tag:\{\{slug\}\}\+featured:true"/);
assert.match(tagTemplate, /category-ad-slot/);

assert.match(termCss, /\.category-featured/);
assert.match(termCss, /\.category-post-list/);
assert.match(termCss, /\.category-ad-slot/);
assert.match(termCss, /\.category-ad-placeholder/);

assert.match(categoriesTemplate, /Latest posts across all primary categories\./);
assert.match(seriesTemplate, /Latest posts in ongoing multi-part writeups\./);
assert.match(routesYaml, /\/categories\//);
assert.match(routesYaml, /\/series\//);

console.log("theme smoke tests passed");
