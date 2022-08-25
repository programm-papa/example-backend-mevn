const dto = {};

dto.user = (model) => {
    let roles = [];
    for (let i = 0; i < model.roles.length; i++) {
        roles.push(model.roles[i].value);
    }
    return {
        login: model.username,
        id: model._id,
        roles: roles,
    }
};

module.exports = dto;