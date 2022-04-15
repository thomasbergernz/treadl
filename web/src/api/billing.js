import api from 'api';

export const billing = {
  get(success, fail) {
    api.authenticatedRequest('GET', '/billing', null, success, fail);
  },
  getPlans(success, fail) {
    api.unauthenticatedRequest('GET', '/billing/plans', null, data => success && success(data.plans), fail);
  },
  updateCard(data, success, fail) {
    api.authenticatedRequest('PUT', '/billing/card', data, success, fail);
  },
  deleteCard(success, fail) {
    api.authenticatedRequest('DELETE', '/billing/card', null, success, fail);
  },
  selectPlan(planId, success, fail) {
    api.authenticatedRequest('PUT', `/billing/subscription/${planId}`, null, success, fail);
  },
};
