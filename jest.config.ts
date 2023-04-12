import { getJestProjects } from '@nrwl/jest';

export default {
  projects: getJestProjects(),
  transform: {
    '^.+\\.[t|j]sx?$': 'ts-jest',
  },
};
