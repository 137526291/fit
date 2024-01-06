<template>
    <form @submit.prevent="addTodo">
        <h2 class="label-wrapper">
            <label for="todo-item" class="label__lg">Add a new todo</label>
        </h2>

        <input type="text" placeholder="Add a new todo" id="new-todo-input" autocomplete="off" v-model.trim="label"
            class="input__lg" />
        <button type="submit" class="btn btn__primary btn__lg">Add</button>

    </form>
</template>

<script>
export default {
    methods: {
        addTodo() {
            if (!this.label) return;
            // console.log("addTodo label value", this.label);
            this.$emit("add-todo", this.label);
            this.label = "";
        },
    },
};
</script>