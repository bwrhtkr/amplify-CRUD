import './App.css';
import { useState, useEffect } from 'react';
import "@aws-amplify/ui-react/styles.css";
import {
  Button,
  Flex,
  Heading,
  TextField,
  View, Table, TableBody, TableRow, TableCell, TableHead, Radio, CheckboxField, SelectField
} from "@aws-amplify/ui-react";
import { listTodos } from "./graphql/queries";
import { createTodo, deleteTodo, updateTodo } from "./graphql/mutations";
import { API } from "aws-amplify";

const App = () => {
  const [user, setUser] = useState({
    firstname: '',
    lastname: '',
    hobbies: [],
    gender: '',
    role: '',
    password: '',
  })
  const [users, setUsers] = useState([]);
  const [userId, setUserId] = useState('');
  const [selectValue, setSelectValue] = useState('')

  useEffect(() => {
    fetchUsers();
  }, []);
  // Read
  const fetchUsers = async () => {
    const apiData = await API.graphql({ query: listTodos });
    const userFromAPI = apiData?.data?.listTodos?.items;
    setUsers(userFromAPI);
  }

  // Checked Values
  const onChecked = (e) => {
    if (e.target.checked) {
      setUser({
        ...user,
        hobbies: [...user.hobbies, e.target.value],
      });
    } else {
      setUser({
        ...user,
        hobbies: user.hobbies.filter((hobbie) => hobbie !== e.target.value),
      });
    }
  };

  // Radio
  const onGenderChange = (e) => {
    setUser({
      ...user,
      gender: e.target.value,
    });
  };

  // Create
  const createUser = async (e) => {
    e.preventDefault();
    if (userId !== '') {
      const form = new FormData(e.target);
      const data = {
        firstname: form?.get("firstname"),
        lastname: form?.get("lastname"),
        hobbies: user.hobbies,
        gender: form.get("gender"),
        role: form?.get("role"),
        password: form?.get("password"),
        id: user?.id,
      };
      await API.graphql({
        query: updateTodo,
        variables: { input: data },
      });
    } else {
      const form = new FormData(e.target);
      const data = {
        firstname: form?.get("firstname"),
        lastname: form?.get("lastname"),
        hobbies: user.hobbies,
        gender: form?.get("gender"),
        role: form?.get("role"),
        password: form?.get("password"),
      };
      await API.graphql({
        query: createTodo,
        variables: { input: data },
      });
    }
    e.target.reset();
    reset()
    fetchUsers();
    setUserId('')
    setSelectValue('')
  }
  // Edit
  const editUser = ({ id }) => {
    setUserId(id)
    setUser(users?.filter((user) => user.id === id)[0])
  }
  // Delete
  const deleteUser = async ({ id }) => {
    setUsers(users?.filter((user) => user.id !== id));
    await API?.graphql({
      query: deleteTodo,
      variables: { input: { id } },
    });
    reset()
    setUserId('')
    setSelectValue('')
  };

  const reset = () => {
    setUser(
      {
        firstname: '',
        lastname: '',
        hobbies: [],
        gender: '',
        role: '',
        password: '',
      })
  }

  return (
    <>
      <View className="App">
        <Heading level={1}>User Details</Heading>
        <View as="form" margin="3rem 0" onSubmit={createUser}>
          <Flex direction="row" justifyContent="center">
            <TextField
              name="firstname"
              placeholder="First Name"
              label="First Name"
              labelHidden
              defaultValue={userId && user?.firstname}
              variation="quiet"
              required
            />
            <TextField
              name="lastname"
              placeholder="Last Name"
              label="Last Name"
              labelHidden
              defaultValue={userId && user?.lastname}
              variation="quiet"
              required
            />
            <Flex direction='column' gap={0}>
              Hobbies
              <CheckboxField label="Cricket" name="hobbies" defaultValue="Cricket" checked={user?.hobbies?.includes('Cricket')} onChange={onChecked} />
              <CheckboxField label="Coding" name="hobbies" defaultValue="Coding" checked={user?.hobbies?.includes('Coding')} onChange={onChecked} />
              <CheckboxField label="Travelling" name="hobbies" defaultValue="Travelling" checked={user?.hobbies?.includes('Travelling')} onChange={onChecked} />
            </Flex>
            <Flex direction='column' gap={0}>
              Gender
              <Radio name="gender" value="Male" checked={user?.gender?.includes('Male')} onChange={onGenderChange}>Male</Radio>
              <Radio name="gender" value="Female" checked={user?.gender?.includes('Female')} onChange={onGenderChange}>Female</Radio>
            </Flex>
            <SelectField label="Role" name='role' defaultValue={selectValue} onChange={(e) => setSelectValue(e.target.value)}>
              <option defaultValue="Employee" selected={user?.role?.includes('Employee')}>Employee</option>
              <option defaultValue="Manager" selected={user?.role?.includes('Manager')}>Manager</option>
              <option defaultValue="Admin" selected={user?.role?.includes('Admin')}>Admin</option>
            </SelectField>
            <TextField
              name="password"
              placeholder="Password"
              label="Password"
              labelHidden
              defaultValue={userId && user?.password}
              variation="quiet"
              required
            />
          </Flex>
          <Button type="submit" variation="primary" margin="1rem 0">
            {userId !== '' ? 'Update User' : 'Add User'}
          </Button>
        </View>
        <Heading level={2}>All Users</Heading>
        <View margin="1rem 0" border="1">
          <Table
            caption=""
            highlightOnHover={false}>
            <TableHead>
              <TableRow>
                <TableCell as="th">First Name</TableCell>
                <TableCell as="th">Last Name</TableCell>
                <TableCell as="th">Hobbies</TableCell>
                <TableCell as="th">Gender</TableCell>
                <TableCell as="th">Role</TableCell>
                <TableCell as="th">Password</TableCell>
                <TableCell as="th">Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users?.map((user) => (
                <TableRow key={user?.id}>
                  <TableCell>{user?.firstname}</TableCell>
                  <TableCell>{user?.lastname}</TableCell>
                  <TableCell>{user?.hobbies?.join(', ')}</TableCell>
                  <TableCell>{user?.gender}</TableCell>
                  <TableCell>{user?.role}</TableCell>
                  <TableCell>{user?.password}</TableCell>
                  <TableCell><Button variation="link" onClick={() => deleteUser(user)}>
                    Delete
                  </Button>{' '}
                    <Button variation="link" onClick={() => editUser(user)}>
                      Edit
                    </Button></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </View>
      </View>
    </>
  );
}

export default App;
