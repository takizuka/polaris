import {check} from '../../../utilities/testUtils';

const migration = 'v9-scss-replace-breakpoints';
const fixtures = ['v9-scss-replace-breakpoints', 'with-namespace'];

for (const fixture of fixtures) {
  check(__dirname, {
    fixture,
    migration,
    extension: 'scss',
    options: {
      namespace: fixture.includes('with-namespace')
        ? 'legacy-polaris-v8'
        : undefined,
    },
  });
}
